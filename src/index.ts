import PromiseQueue from '@onlymisaky/promise-queue';
import { downloadCore } from './core';
import { getType } from './lib/utils';
import { DownloadOptions, DownloadResult } from './types';

type DestsFunc = (index: number, url: string) => string;

interface Options {
  concurrent: number,
}

function download<T>(
  urls: string | string[],
  output?: string | string[] | DestsFunc,
  options?: Partial<Options & DownloadOptions<T>>
): Promise<DownloadResult | DownloadResult[]> {
  let opt: Partial<Options & DownloadOptions<T>> = options || {};
  let { concurrent, ...opts } = opt;

  let outputPath = '.';
  let type = getType(output);
  if (['string', 'number'].includes(type)) {
    outputPath = output + '';
  }

  if (typeof urls === 'string') {
    return downloadCore(urls, outputPath, opts);
  }

  if (Array.isArray(urls)) {
    concurrent = concurrent || urls.length - 1;
    return new Promise((resolve) => {
      const queue = new PromiseQueue({
        limit: concurrent,
        onAllFinish(results) {
          resolve(results.map((item) => item.status === 'fulfilled' ? item.value : item.reason));
        }
      });

      urls.forEach((url, index) => {
        let outputPath = '';
        if (Array.isArray(output)) {
          outputPath = output[index];
        }
        if (typeof output === 'function') {
          outputPath = output(index, url[index]);
        }
        queue.add(() => downloadCore(url, outputPath, opts));
      });
    });
  }

  return Promise.reject('url 参数错误');
}

export default download;
