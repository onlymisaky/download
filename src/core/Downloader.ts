import * as fs from 'fs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { delSync, mergeFiles, mkdirsSync } from '../lib/dir';
import { sizeFactory, units } from '../lib/file-size';
import { Events } from '../lib/Events';
import { defaultHeaders, formatHeaders, resolveResHeaders } from './headers';
import { genOutput } from './output';
import { DownloadOutput, DownloadEvents, DownloadResult, Obj } from '../types';
import { createRanges } from '../lib/file-size'

export class Downloader extends Events {

  url: string;
  output: DownloadOutput;
  options: {} & AxiosRequestConfig;

  downloaded = 0;
  ranges: Array<string> = [];

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

  async preRequest() {
    const res = await axios.head(this.url, {
      headers: {
        ...defaultHeaders,
        ...this.requestHeaders,
      },
      ...this.requestConfig,
    });
    return formatHeaders(res.headers);
  }

  async parse() {
    super.emit('start-parse');
    const preResHeaders = await this.preRequest();
    let {
      extensions,
      filename: resFilename,
      size,
      acceptRanges,
    } = resolveResHeaders(preResHeaders);
    size = sizeFactory(size, 'B');

    if (acceptRanges && size.MB > 4) {
      let unit = acceptRanges[0].toUpperCase();
      if (unit !== 'B') {
        unit += 'B';
      }
      if (units.includes(unit)) {
        const ranges = createRanges(size[unit], 4);
        this.ranges = ranges.map(({ start, end }) => `${acceptRanges}=${start}-${end}`)
      }
    }

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
      fileSize: size,
    };
    super.emit('finish-parse', this.output);
    return this.output;
  }

  async download(partIndex?: number, Range?: string) {
    let part = '';
    let headers: Obj = this.requestHeaders;
    if (Range) {
      part = `.part${partIndex}`;
      headers = {
        ...headers,
        Range,
      };
    }
    const res: AxiosResponse<fs.ReadStream> = await axios({
      method: 'get',
      url: this.url,
      ...this.requestConfig,
      headers,
      responseType: 'stream',
    });
    let { data } = res;

    const promise = new Promise<DownloadResult>((resolve) => {
      data
        .on('data', (chunk) => {
          this.downloaded += chunk.length;
          super.emit('downloading', chunk, {
            ...this.output,
            downloaded: this.downloaded,
            response: res,
          });
        })
        .pipe(fs.createWriteStream(`${this.output.path}/${this.output.filename}${part}`))
        .on('finish', () => {
          if (!part) {
            super.emit('finish', this.output);
          }
          resolve({
            success: true,
            error: undefined,
            outputPath: this.output.path,
            filename: this.output.filename,
            size: this.output.fileSize.toString(),
          });
        })
        .on('error', (err) => {
          super.emit('error', err);
          const error = part ? { part, error: err } : err;
          resolve({
            success: false,
            error,
            outputPath: this.output.path,
            filename: this.output.filename,
            size: this.output.fileSize.toString(),
          });
        });
    });

    return promise;
  }

  async multithreadingDownload() {
    const promises = this.ranges.map((range, index) => {
      return this.download(index, range);
    });
    const results = await Promise.all(promises);
    const errors = results.filter((item) => {
      return !item.success;
    });
    if (errors.length) {
      return {
        success: false,
        error: errors,
        outputPath: this.output.path,
        filename: this.output.filename,
        size: this.output.fileSize.toString(),
      }
    }
    const fullPath = `${this.output.path}/${this.output.filename}`;
    const parts = this.ranges.map((range, index) => `${fullPath}.part${index}`);
    return new Promise<DownloadResult>((resolve) => {
      mergeFiles([...parts], fullPath, (err) => {
        if (err) {
          super.emit('error', err);
          resolve({
            success: false,
            error: err,
            outputPath: this.output.path,
            filename: this.output.filename,
            size: this.output.fileSize.toString(),
          })
        } else {
          super.emit('finish', this.output);
          parts.forEach((item) => {
            delSync(item);
          });
          resolve({
            success: true,
            error: undefined,
            outputPath: this.output.path,
            filename: this.output.filename,
            size: this.output.fileSize.toString(),
          });
        }
      }
      )
    });
  }

  async start() {
    await this.parse();
    super.emit('start-download', { ...this.output, downloaded: this.downloaded });
    mkdirsSync(this.output.path);
    if (this.ranges.length) {
      return await this.multithreadingDownload();
    }
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
