# download 

> 使用 nodejs 下载文件

## 安装

- [ ] 暂未上传至 npm

## 用法

## 下载单个文件

```js
(async () => {

  // 下载到当前目录，根据 content-disposition 或 url 自动设置文件名
  await download('https://avatars.githubusercontent.com/u/24823322');

  // 下载到 dist/images 下，如果文件夹不存在将自动创建
  await download(
    'https://avatars.githubusercontent.com/u/24823322',
    'dist/images'
  );

  // 下载到 dist/images 下，并将文件命名为 avatar.png
  await download(
    'https://avatars.githubusercontent.com/u/24823322',
    'dist/images/avatar.png'
  );

  /**
   * 下载到 dist/images 下，并将文件命名为 my-avatar 
   * 扩展名根据 MIME 类型判断生成
   * 当你确定要下载的文件类型，而又想设置文件名城时，可通过此方式实现
   */
  const result = await download(
    'https://avatars.githubusercontent.com/u/24823322',
    'dist/images',
    {
      filename: 'my-avatar'
    }
  );

  console.log(result);
  // {
  //   path: '/Users/*/**/dist/images/my-avatar.png', 
  //   file: 'my-avatar.png',
  //   size: '128.3251953125KB'
  // }

})();
```

## 下载多个文件

### 全部下载

```js
(async () => {

  const ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // 所有文件会下载到 dist/images/avatars
  await download(
    ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`),
    'dist/images/avatars'
  );

})();
```

### 下载到不同一个文件夹

```js
(async () => {

  const ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const links = ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`);
  // 下载链接数组与 dest 目录数组一一相对应
  // 0.png 下载到 dist/images/avatars/0/0.png
  // 1.png 下载到 dist/images/avatars/1/1.png
  await download(
    links,
    ids.map((id) => `dist/images/avatars/${id}`),
  );

  // 通过函数创建下载目录
  await download(
    links,
    (index, url) => `dist/images/avatars/${index}-avatar.png`
  );

})();
```

### 分批下载

```js
const ProgressBar = require('progress');
const sizeFormat = require('../lib/file-size');

(async () => {

  const links = [
    `https://apd-e96dba32198fd9a7ff658b2357efea61.v.smtcdns.com/om.tc.qq.com/A8hDaWf1osY5MDop3VsOp-IeUYRIMBOnVKoJeAi_XQ1o/uwMROfz2r5zEIaQXGdGnC2dfJ6norVr71SyOzMWdO4L-7R5f/e0946fex05p.p701.1.mp4?sdtfrom=v1103&guid=f5af37cdf07f1e1d560b5cd23e367c1e&vkey=FF0242DB2CB3240FDC60220B6A7A2CC267F9094144DF31D4371DEF31D0028FA5C20A1B6ACE59C11A266727D0E89F81C1D6EE9987316A0362A1C3F5B77620FFC5A26C7852577D1F9E3CA23B9D8C8BE901453F90CA3015924ABBD0AED6E0ABE64CC545A28F6FFEB35B9D67C9CC7CAC1C3402FEE98DF2359E7971E7D06A40EA7AC4CC58D639590295CA#t=66`,
    `https://apd-c0c9d0c4d2eed0099947e454c1d4d0c8.v.smtcdns.com/om.tc.qq.com/APDs9CNNE5GchhAu3vkv8c7-x5R--P6ExNhrWWMMNXio/uwMROfz2r5zCIaQXGdGnC2dfJ6nY7Lpd3nJnZkkgeq3pDuzz/p0954rf9xk2.p701.1.mp4?sdtfrom=v1103&guid=f5af37cdf07f1e1d560b5cd23e367c1e&vkey=6A1A6BA1B60288BA00A701E0A44D0B1DCAA5C9E3175E7E4B207A500CDA160E2679B4CE27013C203AAAB2C3DC38CDDFF79D2EE7334970D2CE33BC67A5B76C24445CFDE6952E4BD9EEF29A54166EFAAB0B20578895B7BE90F9D89C5FF384A7E750F5AA6D16D53693828F80DF03134F0B89ACCEB628FC9A5CF5AC51038244A80AA3141C0246BFA0D576`,
    `https://apd-f804c69e93dbfb096fd8ab29eace4d36.v.smtcdns.com/om.tc.qq.com/AXgd5ZrpwmFjMTNRQPWqw6CAJlPD5HA9SpP6MH_IV09k/uwMROfz2r5zEIaQXGdGnC2dfJ6norVr71SyOzMWdO4L-7R5f/k09533c9crb.p701.1.mp4?sdtfrom=v1103&guid=f5af37cdf07f1e1d560b5cd23e367c1e&vkey=7FD8CFCB6FB049E2F087CED1C3352C382F5FA459E976DC1E4A4AB3A67059D0B1F2253C92011CD51ED9CAFAD8D5C3E36290F760F723C087B9658803B64F4013BECACD556691830599938B5DDE105EEFECB8CDF4F1FE078589F1F524DD2F3865B1B7FD31D24A739C184FCC10A494A82CD574AC18C0BF3951352FC55D50378A4D66CB2179E7F56828A5`,
    `https://apd-2c12975cbda15c0a8b62e67ce22771d3.v.smtcdns.com/om.tc.qq.com/AFWgM5kxWm5Fovex9ntT7XqzfoMO6dTb-ouW2rExxyH4/uwMROfz2r5zCIaQXGdGnC2dfJ6nY7Lpd3nJnZkkgeq3pDuzz/b0951bo9gn4.p701.1.mp4?sdtfrom=v1103&guid=f5af37cdf07f1e1d560b5cd23e367c1e&vkey=AAB8FE1F40CC693ED8B696A82AE39549A436F7EE84118758D5E8BFDBD8BEF32FAABE6A415A7951706B18D9F82B426605F82332A460D860BE85802AFEC5E5278FCC51D7534CE41FD9872CC42EA27A7F5B911B859A71BF0918E683011DE6CDF1C95FCB07A3E0ABC4EB31F04F3FC1A729F2EE20C8B2C753FA27B09C99AC80A8499B0AA389D94F51CE5A`,
    `https://apd-f804c69e93dbfb096fd8ab29eace4d36.v.smtcdns.com/om.tc.qq.com/AK4kFPfiXi76JvUdzvkOkysCrcpDt4VCWFUJ5OvcLp-A/uwMROfz2r5zEIaQXGdGnC2dfJ6norVr71SyOzMWdO4L-7R5f/o09477tn9cc.p701.1.mp4?sdtfrom=v1103&guid=f5af37cdf07f1e1d560b5cd23e367c1e&vkey=46B752F97627A54D21C3A05C16338D5A9B90F6A1A1C6B16E8833ECD853D4CD2BD09A7C036C757E8C63E3DCA1A853D788E31BB8C25D9A6AF61899AF2DE31D68E6442CC53E5F82270443EE05544010FE4E9D01D6ACA75B4E2A17ED356163921F6E6954A79901CEFAACDD2DFC22605879FA0D2B885422DA437F7E1562250FA851410DA7ED353F05E91D`
  ];

  // 开始下载前会回调
  // 该函数的返回值将会作为参数传给 onDownload 
  function onStartDownload(ctx) {
    const { file, size, } = ctx;
    const progressBar = new ProgressBar(
      ` 正在下载: ${file} :downloaded/${size.toString(2)} :bar :percent`,
      {
        complete: '█',
        head: '',
        incomplete: '░',
        width: 77,
        total: size.B * 1,
      }
    );

    return { progressBar, ...ctx }
  }

  // 下载过成功回调
  function onDownload(chunk, ctx) {
    const {
      progressBar,
      downloaded
    } = ctx;

    progressBar.tick(chunk.length, {
      downloaded: sizeFormat(downloaded, 'B').toString(2),
    });
  }

  // 每次只下载一个文件
  await download(links, 'dist/videos', {
    count: 1, // 设置每次下载文件个数，默认全部下载
    onStartDownload,
    onDownload,
  });

})();
```

![downloading](examples/downloading.png)

