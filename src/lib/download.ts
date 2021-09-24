import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { parseOutput, parseDisposition, parseUrl, split, getExtensionsByMime } from './get-output';
import { mkdirsSync } from './dir';
import sizeFormat, { Size } from './file-size';

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
  response: AxiosResponse<fs.ReadStream>,
  stream: fs.WriteStream,
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

    onRequest();

    const res: AxiosResponse<fs.ReadStream> = await axios({
      method: 'get',
      url: url,
      ...AxiosRequestConfig,
      responseType: 'stream',
    });

    const { data, headers } = res;

    const contentType = headers['content-type'];
    const fileDisposition = headers['content-disposition'];

    filename = filename || _filename || parseDisposition(fileDisposition) || parseUrl(url);

    const arr = [
      filename,
      _filename,
      parseDisposition(fileDisposition),
      parseUrl(url),
    ];

    for (let index = 0; index < arr.length; index++) {
      let [, extname] = split(arr[index], '.');
      if (extname === '') {
        if (index < arr.length - 1) {
          continue;
        } else {
          filename = filename + '.' + getExtensionsByMime(contentType)[0];
        }
      } else {
        break;
      }
    }

    mkdirsSync(outputPath);

    const writer = fs.createWriteStream(`${outputPath}/${filename}`);

    const contentLength = headers['content-length'];
    const fileSize = sizeFormat(contentLength, 'B');

    const result = {
      path: path.resolve(outputPath),
      file: `${filename}`,
      size: `${fileSize}`,
    };

    const ctx = {
      ...result,
      size: fileSize,
      downloaded: 0,
      response: res,
      stream: writer,
    };

    // 通过 onStartDownload 创建自定义上下文，将该对象暴露给 onDownload
    let customCtx = onStartDownload(ctx);

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
