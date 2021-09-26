import * as path from 'path';
import { split } from '../lib/utils';

function parseUrl(requestUrl: string) {
  let filename = '';
  if (requestUrl) {
    filename = path.basename(new URL(requestUrl).pathname);
  }
  return filename;
}

function parseOutput(output: string = '.') {
  let outputPath = '.';
  let filename = '';

  output = output.trim();

  if (['.', ''].includes(output)) {
    return {
      outputPath,
      filename,
    }
  }

  [outputPath, filename] = split(output, '/', 'last');

  let [, extname] = split(filename, '.', 'last');

  if (extname === '') {
    outputPath = output;
    filename = '';
  }

  return {
    outputPath,
    filename,
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

export default function genOutput(options: Opt) {
  const {
    output,
    url = '',
    userFilename = '',
    useExtname = '',
    resFilename = '',
    resExtensions = [''],
  } = options;

  let { outputPath, filename: _filename } = parseOutput(`${output}`);

  let filename = userFilename || _filename || resFilename || parseUrl(url);

  const arr = [
    filename,
    _filename,
    resFilename,
    parseUrl(url),
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
