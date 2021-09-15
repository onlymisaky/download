import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import resolveDest from './resolve-dest';
import getExtByMime from './get-ext';
import getFilename from './get-filename';
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

export interface Options<T> {
  filename: string;
  onStartDownload: OnStartDownload<T>,
  onDownload: OnDownload<T>,
}

async function download<T = {}>(
  url: string,
  dest: string,
  options: Partial<Options<T> & AxiosRequestConfig> = {}
) {

  try {
    let {
      filename,
      onStartDownload = () => undefined,
      onDownload = () => { },
      ...AxiosRequestConfig
    } = options;

    let { output, name, ext } = resolveDest(`${dest}`);

    const res: AxiosResponse<fs.ReadStream> = await axios({
      method: 'get',
      url: url,
      ...AxiosRequestConfig,
      responseType: 'stream',
    });

    const { data, headers } = res;

    const fileType = headers['content-type'];
    const fileDisposition = headers['content-disposition'];

    filename = filename || name || getFilename(fileDisposition, url);
    let [_filename, _ext] = filename.split('.');
    filename = _filename;
    ext = ext || getExtByMime(fileType) || _ext;

    mkdirsSync(output);

    const outputPath = `${output}/${filename}${ext}`;

    const writer = fs.createWriteStream(`${output}/${filename}${ext}`);

    const contentLength = headers['content-length'];
    const fileSize = sizeFormat(contentLength, 'B');

    const result = {
      path: path.resolve(outputPath),
      file: `${filename}${ext}`,
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
