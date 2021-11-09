import * as fs from 'fs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { delSync, mergeFiles, mkdirsSync } from '../lib/dir';
import { sizeFactory, units, createRanges } from '../lib/file-size';
import { Events } from '../lib/Events';
import { defaultHeaders, formatHeaders, resolveResHeaders } from './headers';
import { genOutput } from './output';
import { DownloadOutput, DownloadEvents, DownloadResult, Obj, DownloadConfig } from '../types';

export class Downloader extends Events {

  url: string;
  output: DownloadOutput;
  axiosConfig: AxiosRequestConfig;
  config: DownloadConfig;

  downloaded = 0;
  /** 超过 4 m 就启用分段下载 */
  threshold = 4;
  ranges: Array<string> = [];

  private get requestHeaders() {
    return {
      ...defaultHeaders,
      ...this.axiosConfig.headers,
    };
  }

  private get requestConfig() {
    const { headers, ...otherConfigs } = this.axiosConfig;
    return otherConfigs;
  }

  constructor(
    url: string,
    outputPath: string = '.',
    filename: string = '',
    options: Partial<DownloadConfig> & AxiosRequestConfig = {},
  ) {
    super();
    this.url = url;
    this.output = {
      path: outputPath,
      filename: filename,
      fileSize: sizeFactory(0, 'B')
    };
    let { retryCount, threadCount, ...axiosConfig } = options;
    this.config = {
      retryCount: retryCount === undefined ? 3 : Math.min(10, retryCount),
      threadCount: threadCount === undefined ? 4 : Math.min(16, threadCount),
    };
    this.axiosConfig = axiosConfig;
  }

  preRequest(retryCount: number): Promise<Obj> {
    return axios.head(this.url, {
      headers: {
        ...defaultHeaders,
        ...this.requestHeaders,
      },
      ...this.requestConfig,
    }).then((res) => {
      return formatHeaders(res.headers);
    }).catch((error) => {
      if (retryCount > 0) {
        retryCount--;
        console.log(`第${this.config.retryCount - retryCount}次重试解析: ${this.url}`);
        // super.emit('retry-pre-request', this.config.retryCount - retryCount);
        return this.preRequest(retryCount);
      }
      return Promise.reject(error);
    });
  }

  parseHeaders(headers: Obj) {
    let {
      extensions,
      filename: resFilename,
      size,
      acceptRanges,
    } = resolveResHeaders(headers);
    size = sizeFactory(size, 'B');

    if (acceptRanges && size.MB > this.threshold) {
      let unit = acceptRanges[0].toUpperCase();
      if (unit !== 'B') {
        unit += 'B';
      }
      if (units.includes(unit)) {
        const ranges = createRanges(size[unit], this.config.threadCount);
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
  }

  async download(retryCount: number, partIndex?: number, Range?: string): Promise<DownloadResult> {
    let part = '';
    let headers: Obj = this.requestHeaders;
    if (Range) {
      part = `.part${partIndex}`;
      headers = {
        ...headers,
        Range,
      };
    }

    try {
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
    } catch (error) {
      if (retryCount > 0) {
        retryCount--;
        console.log(`第${this.config.retryCount - retryCount}次重试下载: ${part} ${this.url}`);
        // super.emit('retry-download', this.config.retryCount - retryCount);
        return this.download(retryCount, partIndex, Range);
      }
      throw error;
    }
  }

  async multithreadingDownload() {
    const promises = this.ranges.map((range, index) => {
      return this.download(this.config.retryCount, index, range);
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
    const headers = await this.preRequest(this.config.retryCount);
    this.parseHeaders(headers);
    super.emit('start-download', { ...this.output, downloaded: this.downloaded });
    mkdirsSync(this.output.path);
    if (this.ranges.length) {
      return await this.multithreadingDownload();
    }
    return await this.download(this.config.retryCount);
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
