import { DownloadOptions, } from '../types';
import { Downloader } from './Downloader';

export function downloadCore<T = {}>(
  url: string,
  output: string,
  options: Partial<DownloadOptions<T>> = {}
) {
  let {
    filename: userFilename,
    onStartDownload = () => undefined,
    onDownload = () => { },
    ...AxiosRequestConfig
  } = options;

  const downloader = new Downloader(url, output, userFilename, AxiosRequestConfig);

  let ctx: T | any = undefined;

  return downloader
    .on('start-download', (event) => {
      ctx = onStartDownload({
        outputPath: event.path,
        filename: event.filename,
        size: event.fileSize,
        downloaded: 0,
      });
    })
    .on('downloading', (chunk, event) => {
      onDownload(chunk, {
        outputPath: event.path,
        filename: event.filename,
        size: event.fileSize,
        downloaded: event.downloaded,
        response: event.response
      }, ctx)
    })
    .start();
}
