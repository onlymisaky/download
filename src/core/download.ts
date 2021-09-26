import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosResponse } from 'axios';
import { mkdirsSync } from '../lib/dir';
import sizeFormat from '../lib/file-size';
import { defaultHeaders, resolveResHeaders } from './headers';
import preRequest from './pre-request';
import genOutput from './output';
import {
  Obj,
  DownloadCbCtx,
  DownloadResult,
  DownloadOptions,
} from '../types';

async function download<T = {}>(
  url: string,
  output: string,
  options: Partial<DownloadOptions<T>> = {}
) {

  try {
    let {
      filename: userFilename,
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
      outputPath: path.resolve(outputPath),
      filename: `${filename}`,
      size: `${fileSize}`,
    };

    const { headers: reqHeaders, ...configs } = AxiosRequestConfig;

    const ctx: DownloadCbCtx = {
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

    const promise = new Promise<DownloadResult>((resolve, reject) => {
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

    return promise;
  } catch (err) {
    const error = Promise.reject(err);
    return error;
  }
}

export default download;
