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
  userExtname?: string,
  resFilename?: string,
  resExtensions?: string[],
}

export function genOutput(options: Opt) {
  const {
    output,
    url = '',
    userFilename = '',
    userExtname = '',
    resFilename = '',
    resExtensions = [''],
  } = options;

  let { outputPath, outputFilename } = parseOutput(`${output}`);
  const urlFilename = parseUrl(url);

  let filename = userFilename || outputFilename || resFilename || urlFilename;

  let [, extname] = split(filename, '.', 'last');

  if (extname === '') {
    let extnames = [
      ...[
        userFilename,
        outputFilename,
        resFilename,
        urlFilename
      ].map((item) => split(item, '.', 'last')[1]),
      userExtname,
      resExtensions[0],
    ]
    extname = extnames.find((item) => item) as string;
    filename = filename + '.' + extname;
  }

  return {
    outputPath,
    filename,
  }
}
