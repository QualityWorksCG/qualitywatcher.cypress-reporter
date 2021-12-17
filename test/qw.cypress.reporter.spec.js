"use strict";
const Mocha = require("mocha");
const { Suite, Runner, Test } = Mocha;
const { expect } = require("chai");
const QualityWatcherCypressReporter = require("../lib/index.js");

describe("QualityWatcher Cypress Reporter", function () {
  let mocha;
  let suite;
  let runner;
  const testTitle = "[S1C1] Test 1";
  const testFile = "someTest.spec.js";

  beforeEach(function () {
    mocha = new Mocha({
      reporter: QualityWatcherCypressReporter,
    });
    suite = new Suite("QWCR Suite");
    runner = new Runner(suite);
  });

  describe("Validate test results", function () {
    beforeEach(function () {
      let options = {
        reporterOptions: {
          testRunName: "Test Run Name",
          description: "Test Run Description",
          projectId: 12,
          include_all_cases: true,
        },
      };
      /* eslint no-unused-vars: off */
      let mochaReporter = new mocha._reporter(runner, options);
    });

    it("should have 1 test failure", function (done) {
      const error = { message: "oh snap" };

      const test = new Test(testTitle, function (done) {
        done(new Error(error.message));
      });

      test.file = testFile;
      suite.addTest(test);

      runner.run(function (failureCount) {
        expect(runner, "to satisfy", {});
        expect(failureCount, "to be", 1);
        done();
      });
    });
  });

  describe("Validate report options", () => {
    it.only("error should be thrown for missing projectId", () => {
      expect(function () {
        let options = {
          reporterOptions: {
            testRunName: "Test Run Name",
            description: "Test Run Description",
            include_all_cases: true,
          },
        };
        /* eslint no-unused-vars: off */
        let mochaReporter = new mocha._reporter(runner, options);
      }).to.throw(
        "Missing property/properties on reporterOptions in cypress.json: projectId"
      );
    });
  });
});
