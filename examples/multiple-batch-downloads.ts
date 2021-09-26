import ProgressBar from 'progress';
import sizeFormat from '../src/lib/file-size';
import download from '../src/index';
import { Ctx } from '../src/core/download';

// 开始下载回调
// 该函数的返回值将会作为参数传给 onDownload 
function onStartDownload(ctx: Ctx) {
  const { file, size, } = ctx;
  const progressBar = new ProgressBar(` :title: ${file} :downloaded/${size.toString(2)} :bar :percent`, {
    complete: '█',
    head: '',
    incomplete: '░',
    width: 77,
    total: size.B * 1,
  });
  return progressBar;
}

// 下载中回调
// 第三个参数为 onStartDownload 的返回值，默认为 undefined
function onDownload(chunk: string | Buffer, ctx: Ctx, customCtx?: ProgressBar) {
  const { downloaded } = ctx;
  const progressBar = customCtx;
  progressBar?.tick(chunk.length, {
    title: '正在下载',
    downloaded: sizeFormat(downloaded, 'B').toString(2),
  });
}

async function multipleBatchDownloads() {

  const links = [
    // `https://github.com/citra-emu/citra-web/releases/download/1.0/citra-setup-mac.dmg`,
    `https://dl.dolphin-emu.org/builds/fd/c8/dolphin-master-5.0-15105-x64.7z`,
    `https://dl.dolphin-emu.org/builds/eb/fa/dolphin-master-5.0-15105-universal.dmg`,
    `https://dl.dolphin-emu.org/builds/e8/76/dolphin-master-5.0-15105.dmg`,
    `https://dl.dolphin-emu.org/builds/10/d8/dolphin-master-5.0-15105.apk`
  ];

  // 依次下载，错误的下载不会阻塞后续下载任务
  const result = await download(links, 'download/emu', {
    count: 1, // 设置每次下载文件个数，默认全部同时下载
    onStartDownload,
    onDownload,
  });

  return result;
}

multipleBatchDownloads();
