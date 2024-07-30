/// <reference types="cypress" />
import {
  QualityWatcherResult,
  Status,
  QualityWatcherPayload,
  ReportOptions,
} from "./qualitywatcher.interface";
import Cypress from "cypress";
import { findScreenshotsInDirectory } from "./util";
import { logger, msToTime, getBrowserInfo, formatComment, shouldNotRun } from "./util";
const QualityWatcher = require("./qualitywatcher");
const REGEX_SUITE_AND_TEST_ID = /\bS(\d+)C(\d+)\b/g;

function validateOptions(options) {
  if (!options?.reporterOptions?.qualitywatcher) {
    logger("reporterOptions.qualitywatcher is required in cypress.json or cypress.config.{js|ts}.");
    throw new Error("reporterOptions.qualitywatcher is required in cypress.json or cypress.config.{js|ts}.");
  }

  const { projectId, testRunName, description } = options?.reporterOptions?.qualitywatcher;
  if (!projectId || !testRunName || !description) {
    const missingOptions = [];
    if (!projectId) missingOptions.push("projectId");
    if (!testRunName) missingOptions.push("testRunName");
    if (!description) missingOptions.push("description");

    const errorMessage = `Missing property/properties on reporterOptions.qualitywatcher in cypress.json: ${missingOptions.join(", ")}`;
    logger(errorMessage);
    throw new Error(errorMessage);
  }
}

function checkForEnvironmentalVariables() {
  if (!process.env.QUALITYWATCHER_API_KEY) {
    const errorMessage = "Missing environmental variable/s: QUALITYWATCHER_API_KEY";
    logger(errorMessage);
    throw new Error(errorMessage);
  }
}

function cleanTest(test, status, browserInfo, rOptions: ReportOptions, screenshots: string[]): QualityWatcherResult {
  let { title, attempts, displayError } = test;
  let { duration } = attempts[attempts.length - 1];
  const parent = rOptions?.parentSuiteTitle ? rOptions?.parentSuiteTitle : Array.isArray(title) ? title[0] : 'Cypress tests'
  title = Array.isArray(title) ? title[title.length - 1] : title;
  const { suite_id, test_id } = getSuiteAndCaseIds(title);

  const testCaseDetails = {
    comment: formatComment(displayError, browserInfo, test, title),
    status: status,
    time: duration || 0,
    attachments: rOptions?.uploadScreenshot
      ? screenshots.filter((screenshot) => suite_id && test_id ? screenshot.includes(`[S${suite_id}C${test_id}]`) : screenshot.includes(`${title} (failed).png`))
      : [],
    suite_id: suite_id || undefined,
    test_id: test_id || undefined,
  };

  if (suite_id && test_id) {
    return {
      ...testCaseDetails,
    }
  } else {
    return {
      case: rOptions?.includeCaseWithoutId ? {
        suiteTitle: parent,
        testCaseTitle: title,
        steps: test?.body ? `<pre><code class="language-js">${test?.body}</code></pre>` : '',
      } : undefined,
      ...testCaseDetails,
    };
  }
}

function getSuiteAndCaseIds(title) {
  let suiteId;
  let caseId;
  const suiteAndCaseIds = title.match(REGEX_SUITE_AND_TEST_ID);
  if (suiteAndCaseIds) {
    [suiteId, caseId] = suiteAndCaseIds[suiteAndCaseIds.length - 1].slice(1).split("C");
  }
  return {
    suite_id: Number(suiteId),
    test_id: Number(caseId),
  };
}

export const report = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfig & {
    reporterOptions: {
      qualitywatcher: ReportOptions
    }
  }
) => {
  const results: QualityWatcherResult[] = [];
  let reporterOptions = config.reporterOptions.qualitywatcher;
  let screenshots;

  on("before:run", () => {
    if (shouldNotRun(reporterOptions?.report)) {
      logger(`Skipping QualityWatcher reporter since "reporterOptions.qualitywatcher.report" is false or undefined.`);
      return;
    }
    validateOptions(config);
    checkForEnvironmentalVariables();
  });

  on("after:run", (testResults) => {
    if (shouldNotRun(reporterOptions?.report)) return;
    const {
      runs,
      startedTestsAt,
      endedTestsAt,
      totalDuration,
      config: options,
    } = testResults as any;

    const stats = { startedTestsAt, endedTestsAt, totalDuration };

    reporterOptions.includeAllCases = reporterOptions.hasOwnProperty("includeAllCases")
      ? reporterOptions.includeAllCases
      : true;

    screenshots = findScreenshotsInDirectory(reporterOptions.screenshotFolder);

    const tests = runs.flatMap((run) => run.tests);

    tests.forEach((test) => {
      if (test.state === Status.Pending && reporterOptions.ignoreSkipped) {
        return;
      }
      getTestResult(test, screenshots);
    });

    const qualityWatcherOptions = {
      password: process.env.QUALITYWATCHER_API_KEY,
      projectId: reporterOptions.projectId,
    };

    const qualitywatcher = new QualityWatcher({
      ...qualityWatcherOptions,
      uploadScreenshot: reporterOptions?.uploadScreenshot || false,
      parallel: reporterOptions?.parallel || false,
    });

    const payload = getPayload();

    if (results.length > 0) {
      return qualitywatcher.publishResults(payload);
    } else {
      logger("-  No results to publish. Please ensure that tests are properly matched.");
      return;
    }

    function getTestResult(test, screenshots) {
      const { state } = test;
      const browserInfo = getBrowserInfo(testResults);

      if (state === Status.Passed || state === Status.Failed || state === Status.Pending) {
        const result = cleanTest(test, state, browserInfo, reporterOptions, screenshots);
        // check if test has suite_id and test_id and if not, check if case is included means includeCaseWithoutId is true
        if ((result?.suite_id && result?.test_id) || result?.case) {
          results.push(result);
        }
      }
    }

    function getPayload(): QualityWatcherPayload {
      const body = {
        projectId: Number(reporterOptions.projectId),
        include_all_cases: reporterOptions.includeAllCases,
        testRunName: reporterOptions.testRunName,
        description: `${reporterOptions.description} \nStart: ${stats.startedTestsAt} \nEnd: ${stats.endedTestsAt} \nDuration: ${msToTime(stats.totalDuration)}`,
        suites: Array.from(new Set(results.map(result => result?.suite_id).filter(Boolean))),
        results: results,
        complete: reporterOptions?.complete || false,
        shareableReport: reporterOptions?.generateShareableLink || false,
      };
      return body;
    }
  });
};
