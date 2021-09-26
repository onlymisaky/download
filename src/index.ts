import down from './core/download';
import { getType, slice } from './lib/utils';
import { DownloadOptions, DownloadResult } from './types';

type DestsFunc = (index: number, url: string) => string;

interface Options {
  count: number,
}

function download<T>(
  url: string | string[],
  output?: string | string[] | DestsFunc,
  options?: Partial<Options & DownloadOptions<T>>
): Promise<DownloadResult | PromiseSettledResult<DownloadResult>[]> {
  let opt: Partial<Options & DownloadOptions<T>> = options || {};
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

    const promise = slice(url, count).reduce((prev: Promise<PromiseSettledResult<DownloadResult>[]>, current, taskIdx) => {
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
