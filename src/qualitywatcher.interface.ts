export enum Status {
  Passed = "passed",
  Failed = "failed",
  Skipped = "skipped",
  Pending = "pending",
}

export interface QualityWatcherResult {
  suite_id?: number;
  test_id?: number;
  comment: String;
  status: Status;
  time: number;
  case?: {
    suiteTitle: String;
    testCaseTitle: String;
    steps: String;
  }
}

export interface QualityWatcherPayload {
  projectId: number;
  testRunName: string;
  description: string;
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
}
