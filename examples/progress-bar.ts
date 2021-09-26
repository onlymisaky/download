import ProgressBar from 'progress';
import sizeFormat, { Size } from '../src/lib/file-size';

export function createBar(filename: string, size: Size) {
  const bar = new ProgressBar(` :title: ${filename} :downloaded/${size.toString(2)} :bar :percent`, {
    complete: '█',
    head: '',
    incomplete: '░',
    width: 77,
    total: size.B * 1,
  });
  return bar;
}

export function tickBar(bar: ProgressBar, count: number, downloaded: number) {
  bar.tick(count, {
    title: '正在下载',
    downloaded: sizeFormat(downloaded, 'B').toString(2),
  });
}
