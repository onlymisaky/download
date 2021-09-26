import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { mkdirsSync } from '../lib/dir';
import sizeFormat, { Size } from '../lib/file-size';
import { defaultHeaders, resolveResHeaders } from './headers';
import preRequest from './pre-request';
import genOutput from './output';

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
      filename: userFilename,
      onRequest = () => undefined,
      onStartDownload = () => undefined,
      onDownload = () => { },
      ...AxiosRequestConfig
    } = options;

    const preResHeaders = await preRequest(url);
    const {
      extensions,
      filename: resFilename,
      rangeStart,
      rangeEnd,
      size,
      length,
    } = resolveResHeaders(preResHeaders);

    const { outputPath, filename } = genOutput({
      output,
      url,
      userFilename,
      resFilename,
      resExtensions: extensions
    });

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
        ...defaultHeaders,
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
