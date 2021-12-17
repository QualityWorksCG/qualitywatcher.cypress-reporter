# QualityWatcher Reporter for Cypress

Publishes [Cypress](https://www.cypress.io/) runs on QualityWatcher.

## Install

```shell
$ npm install @qualitywatcher/cypress-reporter --save-dev
```

## Usage

Add reporter and reporterOptions to your `cypress.json`:

```json
...
"reporter": "@qualitywatcher/cypress-reporter",
"reporterOptions": {
  "testRunName": "Test Run Name",
  "description": "Test Run Description",
  "projectId": 12,
  "include_all_cases": true
}
```

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
