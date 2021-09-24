import * as path from 'path';
import contentDisposition from 'content-disposition';
import mimeDB from 'mime-db';

export function parseDisposition(disposition: string) {
  let filename = '';
  if (disposition) {
    const parsed = contentDisposition.parse(disposition);
    if (parsed.parameters && parsed.parameters.filename) {
      filename = parsed.parameters.filename;
    }
  }
  return filename;
}

export function parseUrl(requestUrl: string) {
  let filename = '';
  if (requestUrl) {
    filename = path.basename(new URL(requestUrl).pathname);
  }
  return filename;
}

export function split(str: string, separator: string): [string, string] {
  const arr = str.split(separator);
  const len = arr.length;
  if (len === 1) {
    return [str, ''];
  } else {
    return [arr.slice(0, len - 1).join(separator), arr[len - 1]]
  }
}

export function parseOutput(output: string = '.') {
  let outputPath = '.';
  let filename = '';

  output = output.trim();

  if (['.', ''].includes(output)) {
    return {
      outputPath,
      filename,
    }
  }

  [outputPath, filename] = split(output, '/');

  let [, extname] = split(filename, '.');

  if (extname === '') {
    outputPath = output;
    filename = '';
  }

  return {
    outputPath,
    filename,
  }
}

export function getExtensionsByMime(mime: string) {
  const mimeEntry = mimeDB[mime];
  if (mimeEntry) {
    const extensions = mimeEntry.extensions;
    return extensions || [];
  }
  return [];
}
