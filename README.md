# QualityWatcher Reporter for Cypress

Publishes [Cypress](https://www.cypress.io/) runs on QualityWatcher.

## Install

```shell
$ npm install @qualitywatcher/cypress-reporter --save-dev
```

or

```shell
yarn add -D @qualitywatcher/cypress-reporter
```

## Usage

1. Add QualityWatcher module to `cypress.config.{ts|js}` or `cypress/plugins/index.{ts|js}`:

#### Define Config Setup 

```javascript
const { defineConfig } = require("cypress");
const qualitywatcher = require("@qualitywatcher/cypress-reporter");

module.exports = defineConfig({
  // ...
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // Call the report method with on and config as arguments
      qualitywatcher.report(on, config);
    },
  },
});
```

#### Plugin Setup

```javascript
import * as qualitywatcher from "@qualitywatcher/cypress-reporter";

module.exports = (on, config) => {
  // Call the report method with on and config as arguments
  qualitywatcher.report(on, config);
};
```

or

```javascript
const qualitywatcher = require("@qualitywatcher/cypress-reporter");

module.exports = (on, config) => {
  // Call the report method with on and config as arguments
  qualitywatcher.report(on, config);
};
```


2. Add minimum reporterOptions to your `cypress.config.{ts|js}` or `cypress.json`:

**testRunName**: _string_ test run title

**description**: _string_ test run description

**projectId**: _number_ project ID with which the tests are related

**includeAllCases** _boolean_ (optional:true) whether or not to include all test cases from each suite used

**report** _boolean_ (optional) whether or not to send results to QualityWatcher

> cypress.config.{ts|js}

> NOTE: You will be adding options to a qualitywatcher key in reporterOptions

```javascript
const { defineConfig } = require("cypress");
const qualitywatcher = require("@qualitywatcher/cypress-reporter");

module.exports = defineConfig({
  reporterOptions: {
    qualitywatcher: {
      testRunName: "Test Run Name",
      description: "Test Run Description",
      projectId: 1,
      includeAllCases: true,
      //... use more optional options
      report: true,
      includeCaseWithoutId: true,
      complete: false,
      ignoreSkipped: true,
      generateShareableLink: true,
      parentSuiteTitle: "Smoke suite",
      screenshotFolder: "cypress/screenshots",
      uploadScreenshot: true,
      parallel: false,
    },
  },
  e2e: {
    //...
  },
});

```


or 

> cypress.json

```json
{
  "reporterOptions": {
    "qualitywatcher": {
        "testRunName": "Test Run Name",
        "description": "Test Run Description",
        "projectId": 1,
        "includeAllCases": true,
        "report": true,
        "includeCaseWithoutId": true,
        "complete": false,
        "ignoreSkipped": true,
        "generateShareableLink": true,
        "parentSuiteTitle": "Smoke suite",
        "screenshotFolder": "cypress/screenshots",
        "uploadScreenshot": true,
        "parallel": false,
    }
  }
}
```

Full reporter options

| Option                | Required | Description                                           |
|-----------------------|----------|-------------------------------------------------------|
| projectId             | Yes      | The ID of the project.                                |
| testRunName           | Yes      | The name of the test run.                             |
| description           | Yes      | A description of the test run.                        |
| includeAllCases       | Yes      | Whether to include all test cases from any suite that at least one automated result belongs to in the created run.                     |
| complete              | No       | If true, marks the test run as complete.              |
| includeCaseWithoutId  | No       | Include test cases even if they don't have Suite and Case IDs mapping, this will create new test case/s in QualityWatcher from results.    |
| report                | No       | If true, send results to QualityWatcher.              |
| ignoreSkipped         | No       | If true, skipped tests will be ignored.               |
| generateShareableLink | No       | If true, generates a shareable link for the report.   |
| parentSuiteTitle      | No       | The suite where test cases without IDs will be added. |
| screenshotFolder      | No       | The folder where screenshots are stored.              |
| uploadScreenshot      | No       | If true, uploads screenshots with the report.         |
| parallel              | No       | If true, save results locally to be merged later when doing parallel testing.      |

3. Get API Key from QualityWatcher

   1. Go to your QualityWatcher account
   2. Hover over your profile avatar and click "Profile Settings"
   3. Select the "API Key" menu item
   4. Click the "Generate API Key" button
   5. Copy your API Key, we will use this for posting the results

4. Create a .env file in the root of your project and add API KEY, or update an existing .env

```shell
touch .env
echo "QUALITYWATCHER_API_KEY=[API Key]" >> .env

# For windows:
# type NUL > .env
# echo QUALITYWATCHER_API_KEY=[API Key]  > .env
```

5. Install [dotenv](https://www.npmjs.com/package/dotenv) and require it in your plugin file (if you don't have this already)

> cypress/plugins/index.{ts|js}

```js
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

require("dotenv").config();
import * as qualitywatcher from "@qualitywatcher/cypress-reporter";

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  qualitywatcher.report(on, config);
};
```

> If you don't have any tests in QualityWatcher you can still push your results and create new tests by enabling `includeCaseWithoutId` in your reporterOptions.

OR

> If you have existing test cases ensure that your Cypress tests includes the ID of your QualityWatcher test case and suite that it belongs to. Make sure the suite and test case IDs are distinct from your test titles:

```Javascript
// Good:
it("[S12C1234] Can authenticate a valid user", ...
it("Can authenticate a valid user [S12C1234]", ...

// Bad:
it("S12C123Can authenticate a valid user", ...
it("Can authenticate a valid userS5C123", ...
```

## Parallelization

When doing parallel testing, you need to merge results from different Cypress runs to get a complete report in QualityWatcher. 

1. Enable parallel in your qualitywatcher reporter options
```js
reporterOptions: {
  qualitywatcher: {
    //...
      parallel: true
    //...
  }
}
```

2. Execute merge binary when all parallel jobs are done:

```shell
npx qualitywatcher-cypress-reporter-merge
```

## License

This project is licensed under the [MIT license](/LICENSE.md).
