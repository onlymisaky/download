import down, { Options, Result } from './lib/download';
import { getType, slice } from './lib/utils';

type DestsFunc = (index: number, url: string) => string;

interface DownloadOptions {
  count: number,
}

function download<T>(
  url: string | string[],
  output?: string | string[] | DestsFunc,
  options?: Partial<DownloadOptions & Options<T>>
): Promise<Result | PromiseSettledResult<Result>[]> {
  let opt: Partial<DownloadOptions & Options<T>> = options || {};
  let { count, ...opts } = opt;

  let outputPath = '.';
  let type = getType(output);
  if (['string', 'number'].includes(type)) {
    outputPath = output + '';
  }

  if (typeof url === 'string') {
    return down(url, outputPath, opts);
  }

  if (Array.isArray(url)) {
    count = count || url.length - 1;

    const promise = slice(url, count).reduce((prev: Promise<PromiseSettledResult<Result>[]>, current, taskIdx) => {
      return prev.then((prevResult) => {
        const tasks = current.map((url, urlIdx) => {

          let n = count as number;
          let index = taskIdx * n + urlIdx;
          if (Array.isArray(output)) {
            outputPath = output[index];
          }
          if (typeof output === 'function') {
            outputPath = output(index, url[index]);
          }

          return down(url, outputPath, opts);
        });
        return Promise.allSettled(tasks).then((result) => {
          return [
            ...prevResult,
            ...result,
          ]
        })
      });
    }, Promise.resolve([]));

    return promise;
  }

  return Promise.reject('url 参数错误');
}

export default download;
