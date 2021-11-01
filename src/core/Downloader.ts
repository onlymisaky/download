import * as fs from 'fs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { mkdirsSync } from '../lib/dir';
import { sizeFactory } from '../lib/file-size';
import { Events } from '../lib/Events';
import { defaultHeaders, resolveResHeaders } from './headers';
import { preRequest } from './pre-request';
import { genOutput } from './output';
import { DownloadOutput, DownloadEvents, DownloadResult } from '../types';
export class Downloader extends Events {

  url: string;
  output: DownloadOutput;
  options: {} & AxiosRequestConfig;

  downloaded = 0;

  private get requestHeaders() {
    return {
      ...defaultHeaders,
      ...this.options.headers,
    };
  }

  private get requestConfig() {
    const { headers, ...otherConfigs } = this.options;
    return otherConfigs;
  }

  constructor(
    url: string,
    outputPath: string = '.',
    filename: string = '',
    options: AxiosRequestConfig = {}
  ) {
    super();
    this.url = url;
    this.output = {
      path: outputPath,
      filename: filename,
      fileSize: sizeFactory(0, 'B')
    };
    this.options = options;
  }

  async parse() {
    super.emit('start-parse');
    const preResHeaders = await preRequest(this.url, this.requestConfig);
    const {
      extensions,
      filename: resFilename,
      size,
    } = resolveResHeaders(preResHeaders);
    const { outputPath, filename } = genOutput({
      output: this.output.path,
      url: this.url,
      userFilename: this.output.filename,
      resFilename,
      resExtensions: extensions
    });
    this.output = {
      path: outputPath,
      filename,
      fileSize: sizeFactory(size * 1, 'B'),
    };
    super.emit('finish-parse', this.output);
    return this.output;
  }

  async download() {
    super.emit('start-download', { ...this.output, downloaded: this.downloaded });
    const res: AxiosResponse<fs.ReadStream> = await axios({
      method: 'get',
      url: this.url,
      ...this.requestConfig,
      headers: {
        ...this.requestHeaders,
      },
      ...this.requestConfig,
      responseType: 'stream',
    });
    let { data } = res;

    mkdirsSync(this.output.path);

    const promise = new Promise<DownloadResult>((resolve, reject) => {
      data
        .on('data', (chunk) => {
          this.downloaded += chunk.length;
          super.emit('downloading', chunk, {
            ...this.output,
            downloaded: this.downloaded,
            response: res,
          });
        })
        .pipe(fs.createWriteStream(`${this.output.path}/${this.output.filename}`))
        .on('finish', () => {
          super.emit('finish', this.output);
          resolve({
            outputPath: this.output.path,
            filename: this.output.filename,
            size: this.output.fileSize.toString()
          });
        })
        .on('error', (err) => {
          super.emit('error', err);
          reject(err);
        });
    });

    return promise;
  }

  async start() {
    await this.parse();
    return await this.download();
  }

  override on<K extends keyof DownloadEvents>(event: K, listener: DownloadEvents[K]): this {
    super.on(event, listener);
    return this;
  }

  override once<K extends keyof DownloadEvents>(event: K, listener: (...args: any[]) => any): this {
    super.once(event, listener);
    return this;
  }

}
