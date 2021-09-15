import down, { Options, Result } from './lib/download';
import { getType, slice } from './lib/utils';

type DestsFunc = (index: number, url: string) => string;

interface DownloadOptions {
  count: number,
}

function download<T>(
  urls: string | string[],
  dests?: string | string[] | DestsFunc,
  options?: Partial<DownloadOptions & Options<T>>
): Promise<Result | PromiseSettledResult<Result>[]> {
  let opt: Partial<DownloadOptions & Options<T>> = options || {};
  let { count, ...opts } = opt;

  let dest = '.';
  let type = getType(dests);
  if (['string', 'number'].includes(type)) {
    dest = dests + '';
  }

  if (typeof urls === 'string') {
    return down(urls, dest, opts);
  }

  if (Array.isArray(urls)) {
    count = count || urls.length - 1;

    const promise = slice(urls, count).reduce((prev: Promise<PromiseSettledResult<Result>[]>, current, taskIdx) => {
      return prev.then((prevResult) => {
        const tasks = current.map((url, urlIdx) => {

          let n = count as number;
          let index = taskIdx * n + urlIdx;
          if (Array.isArray(dests)) {
            dest = dests[index];
          }
          if (typeof dests === 'function') {
            dest = dests(index, urls[index]);
          }

          return down(url, dest, opts);
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

export default download
