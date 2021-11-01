import * as path from 'path';
import { split } from '../lib/utils';

export function parseUrl(requestUrl: string) {
  let filename = '';
  if (requestUrl) {
    filename = path.basename(new URL(requestUrl).pathname);
  }
  return filename;
}

export function parseOutput(output: string = '.') {
  let outputPath = '.';
  let outputFilename = '';

  output = output.trim();

  if (['.', ''].includes(output)) {
    return {
      outputPath,
      outputFilename,
    }
  }

  [outputPath, outputFilename] = split(output, '/', 'last');

  let [, extname] = split(outputFilename, '.', 'last');

  if (extname === '') {
    outputPath = output;
    outputFilename = '';
  }

  return {
    outputPath,
    outputFilename,
  }
}

interface Opt {
  output: string,
  url?: string,
  userFilename?: string,
  useExtname?: string,
  resFilename?: string,
  resExtensions?: string[],
}

export function genOutput(options: Opt) {
  const {
    output,
    url = '',
    userFilename = '',
    useExtname = '',
    resFilename = '',
    resExtensions = [''],
  } = options;

  let { outputPath, outputFilename } = parseOutput(`${output}`);
  const urlFilename = parseUrl(url);

  let filename = userFilename || outputFilename || resFilename || urlFilename;

  const arr = [
    filename,
    outputFilename,
    resFilename,
    urlFilename,
  ];

  for (let index = 0; index < arr.length; index++) {
    let [, extname] = split(arr[index], '.', 'last');
    if (extname === '') {
      if (index < arr.length - 1) {
        continue;
      } else {
        filename = filename + '.' + (useExtname || resExtensions[0]);
      }
    } else {
      break;
    }
  }

  return {
    outputPath,
    filename,
  }
}
