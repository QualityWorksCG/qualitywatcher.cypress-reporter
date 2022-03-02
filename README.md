# QualityWatcher Reporter for Cypress

Publishes [Cypress](https://www.cypress.io/) runs on QualityWatcher.

## Install

```shell
$ npm install @qualitywatcher/cypress-reporter --save-dev
```

## Usage

1. Add QualityWatcher module to `cypress/plugins/index.{ts|js}:`

```javascript
const qualitywatcher = require("@qualitywatcher/cypress-reporter");

module.exports = (on, config) => {
  // Call the report method with on and config as arguments
  qualitywatcher.report(on, config);
};
```

2. Add reporterOptions to your `cypress.json`:

```json
...
"reporterOptions": {
  "testRunName": "Test Run Name",
  "description": "Test Run Description",
  "projectId": 12,
  "include_all_cases": true
}
```

3. Get API Key from QualityWatcher
   1. Go to your QualityWatcher account
   2. Hover over your profile avatar and click "Profile Settings"
   3. Select the "API Key" menu item
   4. Click the "Generate API Key" button
   5. Copy your API Key, we will use this for posting the results

Your Cypress tests should include the ID of your QualityWatcher test case and suite that it belongs to. Make sure the suite and test case IDs are distinct from your test titles:

```Javascript
// Good:
it("[S12C1234] Can authenticate a valid user", ...
it("Can authenticate a valid user [S12C1234]", ...

// Bad:
it("S12C123Can authenticate a valid user", ...
it("Can authenticate a valid userS5C123", ...
```

## License

This project is licensed under the [MIT license](/LICENSE.md).
