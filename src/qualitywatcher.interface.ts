export enum Status {
  Passed = "passed",
  Failed = "failed",
  Skipped = "skipped",
  Pending = "pending",
}

export interface QualityWatcherResult {
  suite_id: number;
  test_id: number;
  comment: String;
  status: Status;
  time: number;
}

export interface QualityWatcherPayload {
  projectId: number;
  testRunName: string;
  description: string;
  results: QualityWatcherResult[];
}

export interface QualityWatcherOptions {
  url: string;
  username: string;
  password: string;
  projectId: number;
}
