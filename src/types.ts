import * as fs from 'fs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Size } from './lib/file-size';

export interface Obj<V = any> {
  [key: string | symbol]: V;
}

export type DownloadOptions<T> = {
  filename: string;
  onStartDownload: OnStartDownload<T>,
  onDownload: OnDownload<T>,
} & AxiosRequestConfig;

export interface DownloadCbCtx {
  outputPath: string,
  filename: string,
  size: Size,
  downloaded: number,
  response?: AxiosResponse<fs.ReadStream>,
}

export type OnStartDownload<T> = (ctx: DownloadCbCtx) => T;
export type OnDownload<T> = (chunk: string | Buffer, ctx: DownloadCbCtx, customCtx?: T) => void;

export interface DownloadResult {
  success: boolean;
  error: any;
  outputPath: string,
  filename: string,
  size: string;
}

export interface DownloadOutput {
  path: string,
  filename: string,
  fileSize: Size
}

export interface DownloadEvents {
  'start-parse'(): void,
  'finish-parse'(ev: DownloadOutput): void;
  'start-download'(ev: DownloadOutput & { downloaded: number, response?: AxiosResponse<fs.ReadStream>, }): void;
  'downloading'(chunk: string | Buffer, ev: DownloadOutput & { downloaded: number, response?: AxiosResponse<fs.ReadStream>, }): void;
  'finish'(ev: DownloadOutput): void;
  'error'(err: any): void;
}

export interface Range {
  start: number,
  end: number,
}

export interface DownloadThread extends Range {
  url: string,
  output: string,
  downloaded: number,
  status: 'pending' | 'downloading' | 'finish' | 'error',
}
