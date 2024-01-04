export enum Status {
  Passed = "passed",
  Failed = "failed",
  Skipped = "skipped",
  Pending = "pending",
}

export interface QualityWatcherResult {
  suite_id: number | undefined;
  test_id: number | undefined;
  comment: string;
  status: string;
  time: number;
  case?:
  | {
    suiteTitle: string;
    testCaseTitle: string;
    steps: string;
  }
  | undefined;
  attachments?: string[];
}

export interface QualityWatcherPayload {
  projectId: number;
  testRunName: string;
  description: string;
  include_all_cases: boolean;
  complete?: boolean;
  shareableReport?: boolean;
  results: QualityWatcherResult[];
}

export interface QualityWatcherOptions {
  url: string;
  password: string;
  projectId: number;
}

export interface ReportOptions {
  projectId: number;
  testRunName: string;
  description: string;
  includeAllCases: boolean;
  complete?: boolean;
  includeCaseWithoutId?: boolean;
  report?: boolean;
  ignoreSkipped?: boolean;
  generateShareableLink?: boolean;
  parentSuiteTitle?: string;
  screenshotFolder?: string;
  uploadScreenshot?: boolean;
}
