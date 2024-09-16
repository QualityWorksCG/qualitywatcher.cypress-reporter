import {
  QualityWatcherOptions,
  QualityWatcherPayload,
  ReportOptions,
} from "./qualitywatcher.interface";
import axios from "axios";
import colors from "colors/safe";
import { logger, getMimeType } from "./util";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
import path from "path";

class QualityWatcher {
  private url: string;
  private options: QualityWatcherOptions & Partial<ReportOptions>;
  private signedUrl: string;

  constructor(options: QualityWatcherOptions & Partial<ReportOptions>) {
    const apiEnvironment = process.env.QUALITYWATCHER_API_ENVIRONMENT || "prod";
    const signedEndpoint = process.env.QUALITYWATCHER_SIGNED_URL_ENDPOINT || "https://api.qualitywatcher.com/nimble/v1/import-management/getSignedUrl-public";
    this.options = options;
    this.url = `https://api.qualitywatcher.com/${apiEnvironment}/nimble/v1/test-runner/add-automated-test-execution`;
    this.signedUrl = signedEndpoint;
  }

  private async uploadAttachment(result: any, attachmentPath: string) {
    logger(colors.grey("-  Uploading attachment..."));
    const attachmentUrl = await this.processAttachments(result, attachmentPath);
    logger(colors.grey("-  Attachment uploaded!"));
    return attachmentUrl;
  }

  public async publishResults(payload: QualityWatcherPayload) {
    logger(colors.green(colors.bold(`(${colors.underline("QualityWatcher")})\n`)));

    if (this.options.uploadScreenshot) {
      for (const result of payload.results) {
        if (result.attachments && result.attachments.length > 0) {
          const attachmentUrls = await Promise.all(result.attachments.map(attachment => this.uploadAttachment(result, attachment)));
          result.attachments = attachmentUrls;
        }
      }
    }

    if (this.options.parallel) {
      logger(colors.grey("-  Parallel execution enabled. Results will be published after all tests are completed."));
      await this.saveResults(payload);
      return;
    }


    try {
      logger(colors.grey("-  Publishing results..."));
      const response = await axios.post(this.url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bear ${this.options.password}`,
        },
      });
      logger(`${colors.grey("-  Results published: ")} ${colors.green(response?.data?.link || "See QualityWatcher for details")}`);
      if (response?.data?.shareableReportLink) {
        logger(`${colors.grey("-  Shareable Report Link: ")} ${colors.green(response?.data?.shareableReportLink || "See QualityWatcher for details")}`);
      }
      return {
        data: response.data,
        error: null,
      }
    } catch (error) {
      logger(colors.red(`-  There was an error publishing results: ${error}`));
      if (error?.response) {
        const { data } = error?.response;
        if (data?.code === 400) {
          logger(colors.red(`-  Bad Request: ${data?.error}`));
          return {
            data: null,
            error: data?.error || "Bad Request",
          }
        } else if (error?.response?.status === 500) {
          logger(colors.red(`- Ensure that your API key is correct.`));
          return {
            data: null,
            error: "Ensure that your API key is correct.",
          }
        } else {
          logger(colors.red(`-  ${data?.error}`));
          return {
            data: null,
            error: data?.error || "Error",
          }
        }
      } else {
        logger(colors.red(`- Ensure that your API key is correct.`));
        return {
          data: null,
          error: "Ensure that your API key is correct.",
        }
      }
    }
  }

  private async upload(signedUrl: string, filePath: string) {
    try {
      const file = await fs.promises.readFile(filePath);
      const fileType = getMimeType(filePath);

      const response = await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': fileType,
        },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to upload with status ${response.status}`);
      }

      return {
        data: signedUrl.split('?')[0],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error.message,
      };
    }
  }

  private async processAttachments(result: any, attachmentPath: string) {
    const attachmentId = result?.suite_id && result?.test_id ? `${result.suite_id}-${result.test_id}` : "";
    const uploadName = `attachment-${attachmentId}-${uuidv4()}.png`;
    const fileType = getMimeType(attachmentPath);

    if (attachmentPath) {
      try {
        const response = await axios.post(this.signedUrl, {
          fileName: uploadName,
          contentType: fileType,
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.options.password}`,
          },
        });

        const data = response.data;
        if (data.signedUrl) {
          const fullAttachmentPath = path.resolve(attachmentPath);
          const response = await this.upload(data.signedUrl, fullAttachmentPath);

          if (response.data) {
            return response.data;
          }
        }
      } catch (error) {
        console.log({ error });
        return null;
      }
    }
  }

  public async saveResults(payload: QualityWatcherPayload) {
    const resultsDir = path.join(process.cwd(), 'qualitywatcher-results');
    await fs.promises.mkdir(resultsDir, { recursive: true });
    const filename = `results-${Date.now()}.json`;
    const filePath = path.join(resultsDir, filename);
    await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2));
    logger(colors.grey(`- Results saved locally to: ${filePath}`));
  }
}

export = QualityWatcher;
