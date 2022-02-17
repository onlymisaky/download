import ProgressBar from 'progress';
import download from '../src/index';
import { DownloadCbCtx } from '../src/types';
import { createBar, tickBar } from './progress-bar'

// 开始下载回调
// 该函数的返回值将会作为参数传给 onDownload 
function onStartDownload(ctx: DownloadCbCtx) {
  return createBar(ctx.filename, ctx.size)
}

// 下载中回调
// 第三个参数为 onStartDownload 的返回值，默认为 undefined
function onDownload(chunk: string | Buffer, ctx: DownloadCbCtx, customCtx?: ProgressBar) {
  tickBar(customCtx as ProgressBar, chunk.length, ctx.downloaded)
}

async function multipleBatchDownloads() {

  const links = [
    // `https://github.com/citra-emu/citra-web/releases/download/1.0/citra-setup-mac.dmg`,
    // `https://dl.dolphin-emu.org/builds/fd/c8/dolphin-master-5.0-15105-x64.7z`,
    // `https://dl.dolphin-emu.org/builds/eb/fa/dolphin-master-5.0-15105-universal.dmg`,
    // `https://dl.dolphin-emu.org/builds/e8/76/dolphin-master-5.0-15105.dmg`,
    // `https://dl.dolphin-emu.org/builds/10/d8/dolphin-master-5.0-15105.apk`
    // `http://allall02.baidupcs.com/file/37cb9343c455b5aada7ffb89721c1f2c?bkt=en-cf7b18a7c51d907881525bde788798798c6366862a2b425746bcadc626e058143cff7058c515b0b3&fid=4006573528-250528-682711491775141&time=1637047062&sign=FDTAXUbGERQlBHSKfWaqi-DCb740ccc5511e5e8fedcff06b081203-tYS0X%2BYKgjRea1iGyaRA8srXwTE%3D&to=19&size=2914874206&sta_dx=2914874206&sta_cs=17987&sta_ft=rar&sta_ct=7&sta_mt=0&fm2=MH%2CXian%2CAnywhere%2C%2Cguangdong%2Cct&ctime=1533317378&mtime=1637047061&resv0=-1&resv1=0&resv2=rlim&resv3=5&resv4=2914874206&vuk=4006573528&iv=2&htype=&randtype=&tkbind_id=0&esl=1&newver=1&newfm=1&secfm=1&flow_ver=3&pkey=en-500cf6e07df93ca42e869d3211d566e8c7acc53a17e69881dcd08e96e5d2de29130dbeeb16bdcde2&expires=8h&rt=pr&r=463507088&vbdid=-&fin=WIICH032.rar&bflag=d6,301,44,19-19&err_ver=1.0&check_blue=1&rtype=1&devuid=BDIMXV2-O_3F46C71224844A468A4F154B99A68B14-C_0-D_0-M_525400923B87-V_0E564ACA&clienttype=8&channel=00000000000000000000000000000000&dp-logid=495762217596486295&dp-callid=0.1&tsl=0&csl=0&fsl=-1&csign=U4BThiySSKoe6bZiXxahfxFxrlk%3D&so=1&ut=1&uter=0&serv=0&uc=3580168543&ti=4744d9fc935001bfafa84d618e5874d1a05907cf1de0e99e&hflag=30&from_type=3&adg=c_668f71ba84ad62886eaec8e7571f3003&reqlabel=250528_l_4d0070e885a19d6ac9881389a83c263f_-1_14a0420d95eaea9db06c591ffaf3db3e&ibp=1&by=themis`
    // "https://d.pcs.baidu.com/file/c1a32b172v815ce01e66babfd91dd4e5?fid=3524068027-250528-512512391069010&dstime=1639537627&rt=sh&sign=FDtAERVJouK-DCb740ccc5511e5e8fedcff06b081203-6v5EXVC1AcDke5JfKtA03%2BuKj44%3D&expires=8h&chkv=1&chkbd=0&chkpc=&dp-logid=11396620144832072&dp-callid=0&shareid=2210305495&r=163659143&resvsflag=1-12-0-1-1-1&vuk=3458943804&file_type=0"
    "https://d.pcs.baidu.com/file/c1a32b172v815ce01e66babfd91dd4e5?fid=3524068027-250528-512512391069010&dstime=1639537842&rt=sh&sign=FDtAERVJouK-DCb740ccc5511e5e8fedcff06b081203-EFNDkGfvIdsu9l3BIUGPLub031I%3D&expires=8h&chkv=1&chkbd=0&chkpc=&dp-logid=11454509717606495&dp-callid=0&shareid=2210305495&r=838729994&resvsflag=1-12-0-1-1-1&vuk=3458943804&file_type=0"
  ];

  // 依次下载，错误的下载不会阻塞后续下载任务
  const result = await download(links, 'download/emu', {
    concurrent: 2, // 设置每次下载文件个数，默认全部同时下载
    onStartDownload,
    onDownload,
    retryCount: 2,
    threadCount: 4,
    headers: {
      'User-Agent': 'softxm;netdisk'
    }
  });

  return result;
}

multipleBatchDownloads();
