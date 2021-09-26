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
  outputPath: string,
  filename: string,
  size: string;
}

export interface DownloadEvents {
  on(event: 'pre-request', listener: () => void): DownloadEvents;
  on(event: 'start-parse', listener: () => void): DownloadEvents;
  on(event: 'finish-parse', listener: (result: DownloadResult) => void): DownloadEvents;
  on(event: 'start-download', listener: (ctx: DownloadCbCtx) => void): DownloadEvents;
  on(event: 'downloading', listener: (chunk: string | Buffer, ctx: DownloadCbCtx) => void): DownloadEvents;
  on(event: 'finish', listener: (result: DownloadResult) => void): DownloadEvents;
  on(event: 'error', listener: (err: any) => void): DownloadEvents;
}
