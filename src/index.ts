/// <reference types="cypress" />
import {
  QualityWatcherResult,
  Status,
  QualityWatcherPayload,
  ReportOptions,
} from "./qualitywatcher.interface";
import Cypress from "cypress";
const QualityWatcher = require("./qualitywatcher");
const { logger, msToTime, getBrowserInfo } = require("./util");
const REGEX_SUITE_AND_TEST_ID = /\bS(\d+)C(\d+)\b/g;

function validateOptions(options) {
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

function checkForEnvironmentalVariables() {
  const missingEnvVars = [];
  if (!process.env.QUALITYWATCHER_API_KEY) {
    missingEnvVars.push("QUALITYWATCHER_API_KEY");
  }

  if (missingEnvVars?.length > 0) {
    const errorMessage = `Missing environmental variable/s: ${missingEnvVars.join(
      ", "
    )}`;
    logger(errorMessage);
    throw new Error(errorMessage);
  }
}

function cleanTest(test, status, browserInfo) {
  let { title, attempts, displayError } = test;
  let { duration } = attempts[attempts.length - 1];
  title = title[title.length - 1];
  const { suite_id, test_id } = getSuiteAndCaseIds(title);
  if (suite_id && test_id) {
    return {
      suite_id: suite_id,
      test_id: test_id,
      comment: displayError
        ? `${displayError} \n\n\n ${browserInfo} \n\n **Code:**\n\n----- \n\n` +
          "```js\n" +
          `${test?.body}`
        : `${title} \n${browserInfo}`,
      status: status,
      time: duration || 0,
    };
  }
}

function getSuiteAndCaseIds(title) {
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

export const report = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfig & { reporterOptions: ReportOptions }
) => {
  const results: QualityWatcherResult[] = [];
  let reporterOptions = config.reporterOptions;

  on("before:run", () => {
    validateOptions(config);
    checkForEnvironmentalVariables();
  });

  on("after:run", (testResults) => {
    const {
      runs,
      startedTestsAt,
      endedTestsAt,
      totalDuration,
      config: options,
    } = testResults as any;

    const stats = { startedTestsAt, endedTestsAt, totalDuration };

    reporterOptions["includeAllCases"] = reporterOptions.hasOwnProperty(
      "includeAllCases"
    )
      ? reporterOptions?.includeAllCases
      : true;

    const tests = runs.map((run) => run.tests).flat();

    tests.forEach((test) => {
      getTestResult(test);
    });

    const qualityWatcherOptions = {
      password: process.env.QUALITYWATCHER_API_KEY,
      projectId: reporterOptions?.projectId,
    };

    const qualitywatcher = new QualityWatcher(qualityWatcherOptions);
    const payload = getPayload();

    if (results.length > 0) {
      return qualitywatcher.publishResults(payload);
    } else {
      logger(
        `-  No results to publish. Please ensure that tests are properly matched.`
      );
      return;
    }

    function getTestResult(test) {
      let { state } = test;
      const browserInfo = getBrowserInfo(testResults);

      if (Status.Passed === state) {
        results.push(cleanTest(test, Status.Passed, browserInfo));
      }

      if (Status.Failed === state) {
        results.push(cleanTest(test, Status.Failed, browserInfo));
      }

      if (Status.Pending === state) {
        results.push(cleanTest(test, Status.Skipped, browserInfo));
      }
    }

    function getPayload(): QualityWatcherPayload {
      const suites = [...new Set(results.map((result) => result?.suite_id))];
      const body = {
        projectId: Number(reporterOptions?.projectId),
        include_all_cases: reporterOptions?.includeAllCases,
        testRunName: `${
          reporterOptions?.testRunName
        } automated test run - ${new Date()}`,
        description: `${reporterOptions?.description} \nStart: ${
          stats?.startedTestsAt
        } \nEnd: ${stats?.endedTestsAt} \nDuration: ${msToTime(
          stats?.totalDuration
        )}`,
        suites,
        results: results,
      };
      return body;
    }
  });
};
