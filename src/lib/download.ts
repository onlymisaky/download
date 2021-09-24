import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { parseOutput, parseUrl, split, } from './get-output';
import { mkdirsSync } from './dir';
import sizeFormat, { Size } from './file-size';
import preRequest from './pre-request';
import { resolveResHeaders } from './headers';

export interface Result {
  path: string,
  file: string,
  size: string;
}

export interface Ctx {
  path: string,
  file: string,
  size: Size,
  downloaded: number,
  response?: AxiosResponse<fs.ReadStream>,
}

export type OnStartDownload<T> = (ctx: Ctx) => T;
export type OnDownload<T> = (chunk: string | Buffer, ctx: Ctx, customCtx?: T) => void;

export type Options<T> = {
  filename: string;
  onRequest(): void;
  onStartDownload: OnStartDownload<T>,
  onDownload: OnDownload<T>,
} & AxiosRequestConfig;

async function download<T = {}>(
  url: string,
  output: string,
  options: Partial<Options<T> & AxiosRequestConfig> = {}
) {

  try {
    let {
      filename,
      onRequest = () => undefined,
      onStartDownload = () => undefined,
      onDownload = () => { },
      ...AxiosRequestConfig
    } = options;

    let { outputPath, filename: _filename } = parseOutput(`${output}`);
    const preResHeaders = await preRequest(url);
    const {
      extensions,
      filename: resFilename,
      rangeStart,
      rangeEnd,
      size,
      length,
    } = resolveResHeaders(preResHeaders);

    filename = filename || _filename || resFilename || parseUrl(url);

    const arr = [
      filename,
      _filename,
      resFilename,
      parseUrl(url),
    ];

    for (let index = 0; index < arr.length; index++) {
      let [, extname] = split(arr[index], '.');
      if (extname === '') {
        if (index < arr.length - 1) {
          continue;
        } else {
          filename = filename + '.' + extensions[0];
        }
      } else {
        break;
      }
    }

    mkdirsSync(outputPath);

    const fileSize = sizeFormat(size, 'B');

    const result = {
      path: path.resolve(outputPath),
      file: `${filename}`,
      size: `${fileSize}`,
    };

    const { headers: reqHeaders, ...configs } = AxiosRequestConfig;

    onRequest();

    const ctx = {
      ...result,
      size: fileSize,
      downloaded: 0,
    };

    // 通过 onStartDownload 创建自定义上下文，将该对象暴露给 onDownload
    let customCtx = onStartDownload(ctx);

    const res: AxiosResponse<fs.ReadStream> = await axios({
      method: 'get',
      url: url,
      ...configs,
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        ...reqHeaders,
      },
      responseType: 'stream',
    });

    let { data } = res;

    const writer = fs.createWriteStream(`${outputPath}/${filename}`);

    // TODO onData 结束，是否也表示写入完成了？
    data.on('data', (chunk) => {
      ctx.downloaded += chunk.length;
      onDownload(chunk, ctx, customCtx);
    });
    data.pipe(writer);

    return new Promise<Result>((resolve, reject) => {
      data.on('error', (err) => {
        reject(err);
      });

      writer.on('error', (err) => {
        reject(err);
      });

      writer.on('finish', () => {
        resolve(result);
      });
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

export default download;
