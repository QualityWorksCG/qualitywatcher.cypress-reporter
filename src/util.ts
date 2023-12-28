import stringify from "fast-safe-stringify";
import fs from "fs";
import path from "path";

export const logger = (message) => {
  let messageOut =
    message instanceof Object ? stringify(message, null, 2) : message;
  console.log(`  ${messageOut}`);
};

export const msToTime = (ms) => {
  let seconds = Number((ms / 1000).toFixed(1));
  let minutes = Number((ms / (1000 * 60)).toFixed(1));
  let hours = Number((ms / (1000 * 60 * 60)).toFixed(1));
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + "s";
  else if (minutes < 60) return minutes + "m";
  else if (hours < 24) return hours + "h";
  else return days + "d";
};

export const getBrowserInfo = (testResults) => {
  const { browserName, browserVersion, osName, osVersion, cypressVersion } = testResults;

  return `
    <div>
      <strong>Browser Info:</strong>
      <hr />
      <blockquote>
        ${browserName} (${browserVersion}) on ${osName} (${osVersion})<br />
        Cypress: ${cypressVersion}
      </blockquote>
    </div>`;
};

export const formatComment = (displayError, browserInfo, test, title) => {
  let formattedResult = '';

  if (displayError) {
    formattedResult += `<p>${displayError}</p>`;
    formattedResult += `<div>${browserInfo}</div>`;
    formattedResult += '<strong>Code:</strong><hr />';
    formattedResult += `<pre><code class="language-js">${test?.body}</code></pre>`;
  } else {
    formattedResult += `<p>${title}</p>`;
    formattedResult += `<div>${browserInfo}</div>`;
  }

  return formattedResult;
}



export const findScreenshotsInDirectory = (directory) => {
  let screenshots = [];
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    if (file.isDirectory()) {
      screenshots = screenshots.concat(findScreenshotsInDirectory(fullPath));
    } else if (file.isFile() && file.name.endsWith('.png')) {
      screenshots.push(fullPath);
    }
  }
  return screenshots;
}

export const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    // ... add other file types as needed
    default:
      return 'application/octet-stream'; // Generic byte stream
  }
}