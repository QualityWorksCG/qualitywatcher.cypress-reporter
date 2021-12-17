"use strict";
const Mocha = require("mocha");
const { logger, msToTime } = require("./util");

const { EVENT_RUN_END, EVENT_TEST_FAIL, EVENT_TEST_PASS } =
  Mocha.Runner.constants;

const STATUS_PASSED = "passed";
const STATUS_FAILED = "failed";
const REGEX_SUITE_AND_TEST_ID = /\bS(\d+)C(\d+)\b/g;

type Status = "passed" | "failed";

interface Result {
  suite_id: number;
  test_id: number;
  comment: String;
  status: Status;
  time: number;
}

interface QWCypressReporterInterface {
  results: Result[];
  cleanTest(test, status: Status, error: Error | null): Result;
}

// this reporter outputs test results, indenting two spaces per suite
class QWCypressReporter implements QWCypressReporterInterface {
  results: Result[];
  reporterOptions;
  constructor(runner, options) {
    const stats = runner.stats;
    this.checkForEnvironmentalVariables();
    this.validateOptions(options);
    this.reporterOptions = options?.reporterOptions;
    this.reporterOptions["include_all_cases"] =
      this.reporterOptions?.include_all_cases || true;
    this.results = [];
    runner
      .on(EVENT_TEST_PASS, (test) => {
        this.results.push(this.cleanTest(test, STATUS_PASSED, null));
      })
      .on(EVENT_TEST_FAIL, (test, error: Error) => {
        this.results.push(this.cleanTest(test, STATUS_FAILED, error));
      })
      .once(EVENT_RUN_END, () => {
        this.sendResults(stats);
      });
  }

  cleanTest(test, status, error) {
    const { duration, title } = test;
    const suiteAndCaseIds = this.getSuiteAndCaseIds(title);
    return {
      suite_id: suiteAndCaseIds.suite_id,
      test_id: suiteAndCaseIds.test_id,
      comment: error ? `${error?.message} \n\n Code: \n ${test?.body} ` : title,
      status: status,
      time: duration || 0,
    };
  }

  getSuiteAndCaseIds(title) {
    let suiteAndCaseIds;
    let suiteId;
    let caseId;
    while ((suiteAndCaseIds = REGEX_SUITE_AND_TEST_ID.exec(title)) != null) {
      suiteId = suiteAndCaseIds[1];
      caseId = suiteAndCaseIds[2];
    }
    return {
      suite_id: Number(suiteId),
      test_id: Number(caseId),
    };
  }

  sendResults(stats) {
    const suites = [...new Set(this.results.map((result) => result?.suite_id))];
    const body = {
      ...this.reporterOptions,
      description: `${this.reporterOptions?.description} \nStart: ${
        stats?.start
      } \nEnd: ${stats?.end} \nDuration: ${msToTime(stats?.duration)}`,
      suites,
      results: this.results,
    };
  }

  validateOptions(options) {
    const missingOptions = [];
    if (!options?.reporterOptions) {
      logger("reporterOptions is required in cypress.json");
      throw new Error("reporterOptions is required in cypress.json");
    }

    if (!options?.reporterOptions?.projectId) {
      missingOptions.push("projectId");
    }

    if (!options?.reporterOptions?.testRunName) {
      missingOptions.push("testRunName");
    }

    if (!options?.reporterOptions?.description) {
      missingOptions.push("description");
    }

    if (missingOptions?.length > 0) {
      const errorMessage = `Missing property/properties on reporterOptions in cypress.json: ${missingOptions.join(
        ", "
      )}`;
      logger(errorMessage);
      throw new Error(errorMessage);
    }
  }

  checkForEnvironmentalVariables() {
    const missingEnvVars = [];
    if (!process.env.QUALITYWATCHER_API_KEY) {
      missingEnvVars.push("QUALITYWATCHER_API_KEY");
    }

    if (!process.env.QUALITYWATCHER_USERNAME) {
      missingEnvVars.push("QUALITYWATCHER_USERNAME");
    }

    if (missingEnvVars?.length > 0) {
      const errorMessage = `Missing environment variables: ${missingEnvVars.join(
        ", "
      )}`;
      logger(`Missing environment variables: ${missingEnvVars.join(", ")}`);
      throw new Error(errorMessage);
    }
  }
}

module.exports = QWCypressReporter;
