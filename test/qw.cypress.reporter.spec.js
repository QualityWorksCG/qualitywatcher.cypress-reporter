"use strict";
const { expect } = require("chai");
const QualityWatcherCypressReporter = require("../lib/index.js");
const EventEmitter = require("events");
const {
  testData,
  expectedResults,
  QUALITYWATCHER_API_KEY,
  QUALITYWATCHER_USERNAME,
} = require("./data");

describe("QualityWatcher Cypress Reporter", function () {
  before(function () {
    process.env.QUALITYWATCHER_API_KEY = QUALITYWATCHER_API_KEY;
    process.env.QUALITYWATCHER_USERNAME = QUALITYWATCHER_USERNAME;
  });

  describe("Validate test results", function () {
    it("should have expected payload properties", function () {
      const body = QualityWatcherCypressReporter.report(testData).getPayload();
      expect(body).to.be.an("object");
      expect(body).to.have.property("results");
      expect(body).to.have.property("testRunName");
      expect(body).to.have.property("description");
      expect(body).to.have.property("projectId");
      expect(body).to.have.property("suites");
    });

    it("should have expected results", function () {
      const body = QualityWatcherCypressReporter.report(testData).getPayload();
      const { results } = body;
      expect(results).to.be.an("array");
      expect(results).to.have.lengthOf(4);
      expect(results).to.deep.equal(expectedResults);
    });
  });

  describe("Validate missing properties", function () {
    const { on, emit } = new EventEmitter();

    ["projectId", "testRunName", "description"].forEach(function (
      expectedProperty
    ) {
      it.only(`should throw error for missing ${expectedProperty}`, () => {
        expect(() => {
          const testDataCopy = JSON.parse(JSON.stringify(testData));
          delete testDataCopy.config.reporterOptions[expectedProperty];
          const { config } = testDataCopy;
          QualityWatcherCypressReporter.report(on, config);
          emit("before:run");
        }).to.throw(
          Error,
          `Missing property/properties on reporterOptions in cypress.json: ${expectedProperty}`
        );
      });
    });

    it("should throw error for multiple missing properties", function () {
      expect(() => {
        const testDataCopy = JSON.parse(JSON.stringify(testData));
        delete testDataCopy.config.reporterOptions.projectId;
        delete testDataCopy.config.reporterOptions.testRunName;
        delete testDataCopy.config.reporterOptions.description;
        QualityWatcherCypressReporter.report(testDataCopy);
      }).to.throw(
        Error,
        "Missing property/properties on reporterOptions in cypress.json: projectId, testRunName, description"
      );
    });
  });

  describe("Validate missing environmental variables", function () {
    it("should throw error for missing QUALITYWATCHER_API_KEY", function () {
      expect(() => {
        delete process.env.QUALITYWATCHER_API_KEY;
        QualityWatcherCypressReporter.report(testData);
      }).to.throw(
        Error,
        "Missing environmental variable/s: QUALITYWATCHER_API_KEY"
      );
    });

    it("should throw error for missing QUALITYWATCHER_USERNAME", function () {
      expect(() => {
        delete process.env.QUALITYWATCHER_USERNAME;
        QualityWatcherCypressReporter.report(testData);
      }).to.throw(
        Error,
        "Missing environmental variable/s: QUALITYWATCHER_USERNAME"
      );
    });

    it("should throw error for missing multiple environmental variables", function () {
      expect(() => {
        delete process.env.QUALITYWATCHER_API_KEY;
        delete process.env.QUALITYWATCHER_USERNAME;
        QualityWatcherCypressReporter.report(testData);
      }).to.throw(
        Error,
        "Missing environmental variable/s: QUALITYWATCHER_API_KEY, QUALITYWATCHER_USERNAME"
      );
    });

    afterEach(function () {
      process.env.QUALITYWATCHER_API_KEY = QUALITYWATCHER_API_KEY;
      process.env.QUALITYWATCHER_USERNAME = QUALITYWATCHER_USERNAME;
    });
  });
});
