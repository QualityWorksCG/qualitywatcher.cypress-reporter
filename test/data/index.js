const expectedResults = [
  {
    suite_id: 23,
    test_id: 456,
    comment:
      "[S23C456] Should calculate the tax for multiple items correctly \n\nBrowser Info:\n-----\n>electron(94.0.4606.81) on darwin(20.6.0)\nCypress: 9.1.1",
    status: "passed",
    time: 8753,
  },
  {
    suite_id: 30,
    test_id: 1234,
    comment:
      "[S30C1234] Verify that I can go to google.com \n\nBrowser Info:\n-----\n>electron(94.0.4606.81) on darwin(20.6.0)\nCypress: 9.1.1",
    status: "passed",
    time: 4700,
  },
  {
    suite_id: 24,
    test_id: 123,
    comment:
      'AssertionError: Timed out retrying after 4000ms: expected \'https://www.google.com/\' to include \'qualitywatcher.com\'\n    at Context.eval (https://www.google.com/__cypress/tests?p=cypress/integration/home.spec.js:106:14) \n\n Code: \n () => {\n    cy.visit("https://www.google.com");\n    cy.url().should("include", "qualitywatcher.com");\n  } \n\nBrowser Info:\n-----\n>electron(94.0.4606.81) on darwin(20.6.0)\nCypress: 9.1.1',
    status: "failed",
    time: 5197,
  },
  {
    suite_id: 24,
    test_id: 126,
    comment:
      "[S24C126] Verify that I can go to apple.com \n\nBrowser Info:\n-----\n>electron(94.0.4606.81) on darwin(20.6.0)\nCypress: 9.1.1",
    status: "skipped",
    time: 0,
  },
];

const testData = {
  startedTestsAt: "2021-12-18T02:33:43.330Z",
  endedTestsAt: "2021-12-18T02:34:11.942Z",
  totalDuration: 21646,
  totalSuites: 3,
  totalTests: 4,
  totalFailed: 1,
  totalPassed: 2,
  totalPending: 1,
  totalSkipped: 0,
  runs: [
    {
      stats: {
        suites: 2,
        tests: 1,
        passes: 1,
        pending: 0,
        skipped: 0,
        failures: 0,
        duration: 8772,
        startedAt: "2021-12-18T02:33:43.330Z",
        endedAt: "2021-12-18T02:33:52.102Z",
      },
      reporter: "spec",
      reporterStats: {
        suites: 2,
        tests: 1,
        passes: 1,
        pending: 0,
        failures: 0,
        start: "2021-12-18T02:33:43.351Z",
        end: "2021-12-18T02:33:52.156Z",
        duration: 8805,
      },
      hooks: [
        {
          hookName: "before all",
          title: ['"before all" hook'],
          body: "() => {\n    cy.visit(calculatorPage.url);\n  }",
        },
        {
          hookName: "after each",
          title: ['"after each" hook'],
          body: "() => {\n    cy.reload();\n  }",
        },
      ],
      tests: [
        {
          title: [
            "Calculate Tax by State",
            "Alabama",
            "[S23C456] Should calculate the tax for multiple items correctly",
          ],
          state: "passed",
          body: '() => {\n      cy.get("select").select(`${0}`);\n      cy.get(calculatorPage.costInputSelector).type(5000);\n      cy.get(calculatorPage.multipleItemsSelector).click();\n      cy.get(calculatorPage.itemAmountInputSelector).type("10");\n      cy.get(calculatorPage.displayMainSelector).then($element => {\n        expect($element.text()).to.equal("$2,000.00");\n      });\n    }',
          displayError: null,
          attempts: [
            {
              state: "passed",
              error: null,
              videoTimestamp: 7080,
              duration: 8753,
              startedAt: "2021-12-18T02:33:43.348Z",
              screenshots: [],
            },
          ],
        },
      ],
      error: null,
      video:
        "/home/projects/cypress-reporter/cypress/videos/calculator.spec.js.mp4",
      spec: {
        name: "calculator.spec.js",
        relative: "cypress/integration/calculator.spec.js",
        absolute:
          "/home/projects/cypress-reporter/cypress/integration/calculator.spec.js",
        specType: "integration",
      },
      shouldUploadVideo: true,
    },
    {
      stats: {
        suites: 1,
        tests: 3,
        passes: 1,
        pending: 1,
        skipped: 0,
        failures: 1,
        duration: 12874,
        startedAt: "2021-12-18T02:33:59.068Z",
        endedAt: "2021-12-18T02:34:11.942Z",
      },
      reporter: "spec",
      reporterStats: {
        suites: 1,
        tests: 3,
        passes: 1,
        pending: 1,
        failures: 1,
        start: "2021-12-18T02:33:59.079Z",
        end: "2021-12-18T02:34:11.949Z",
        duration: 12870,
      },
      hooks: [],
      tests: [
        {
          title: ["Home page", "[S30C1234] Verify that I can go to google.com"],
          state: "passed",
          body: '() => {\n    cy.visit("https://www.google.com");\n    cy.url().should("include", "google.com");\n  }',
          displayError: null,
          attempts: [
            {
              state: "passed",
              error: null,
              videoTimestamp: 6861,
              duration: 4700,
              startedAt: "2021-12-18T02:34:01.697Z",
              screenshots: [],
            },
          ],
        },
        {
          title: [
            "Home page",
            "[S24C123] Verify that I can go to qualityWatcher.com",
          ],
          state: "failed",
          body: '() => {\n    cy.visit("https://www.google.com");\n    cy.url().should("include", "qualitywatcher.com");\n  }',
          displayError:
            "AssertionError: Timed out retrying after 4000ms: expected 'https://www.google.com/' to include 'qualitywatcher.com'\n    at Context.eval (https://www.google.com/__cypress/tests?p=cypress/integration/home.spec.js:106:14)",
          attempts: [
            {
              state: "failed",
              error: {
                name: "AssertionError",
                message:
                  "Timed out retrying after 4000ms: expected 'https://www.google.com/' to include 'qualitywatcher.com'",
                stack:
                  "    at Context.eval (https://www.google.com/__cypress/tests?p=cypress/integration/home.spec.js:106:14)",
                codeFrame: {
                  line: 9,
                  column: 14,
                  originalFile: "cypress/integration/home.spec.js",
                  relativeFile: "cypress/integration/home.spec.js",
                  absoluteFile:
                    "/home/projects/cypress-reporter/cypress/integration/home.spec.js",
                  frame:
                    '   7 |   it("[S24C123] Verify that I can go to qualityWatcher.com", () => {\n   8 |     cy.visit("https://www.google.com");\n>  9 |     cy.url().should("include", "qualitywatcher.com");\n     |              ^\n  10 |   });\n  11 | \n  12 |   it.skip("[S24C126] Verify that I can go to apple.com", () => {',
                  language: "js",
                },
              },
              videoTimestamp: 11566,
              duration: 5197,
              startedAt: "2021-12-18T02:34:06.402Z",
              screenshots: [
                {
                  name: null,
                  takenAt: "2021-12-18T02:34:11.425Z",
                  path: "/home/projects/cypress-reporter/cypress/screenshots/home.spec.js/Home page -- [S24C123] Verify that I can go to qualityWatcher.com (failed).png",
                  height: 720,
                  width: 1280,
                },
              ],
            },
          ],
        },
        {
          title: ["Home page", "[S24C126] Verify that I can go to apple.com"],
          state: "pending",
          body: "",
          displayError: null,
          attempts: [
            {
              state: "pending",
              error: null,
              videoTimestamp: null,
              duration: null,
              startedAt: null,
              screenshots: [],
            },
          ],
        },
      ],
      error: null,
      video: "/home/projects/cypress-reporter/cypress/videos/home.spec.js.mp4",
      spec: {
        name: "home.spec.js",
        relative: "cypress/integration/home.spec.js",
        absolute:
          "/home/projects/cypress-reporter/cypress/integration/home.spec.js",
        specType: "integration",
      },
      shouldUploadVideo: true,
    },
  ],
  browserPath: "",
  browserName: "electron",
  browserVersion: "94.0.4606.81",
  osName: "darwin",
  osVersion: "20.6.0",
  cypressVersion: "9.1.1",
  config: {
    reporterOptions: {
      testRunName: "Test Run Name",
      description: "Test Run Description",
      projectId: 12,
      include_all_cases: true,
      url: "https://my-json-server.typicode.com/dimitriharding/fake-json-server/main/db",
    },
    baseUrl: "https://tax-by-state.vercel.app",
    projectRoot: "/home/projects/cypress-reporter",
    projectName: "cypress-reporter",
    rawJson: {
      reporterOptions: {
        testRunName: "Test Run Name",
        description: "Test Run Description",
        projectId: 12,
        include_all_cases: true,
      },
      baseUrl: "https://tax-by-state.vercel.app",
      envFile: {},
      projectRoot: "/home/projects/cypress-reporter",
      projectName: "cypress-reporter",
    },
  },
  status: "finished",
};

module.exports = {
  testData,
  expectedResults,
  QUALITYWATCHER_API_KEY: 1234,
  QUALITYWATCHER_USERNAME: "test@user.com",
};
