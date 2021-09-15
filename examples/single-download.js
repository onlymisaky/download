const download = require('../index');

async function singleDownload() {
  // 下载到当前目录，根据 content-disposition 或 url 自动设置文件名
  await download('https://avatars.githubusercontent.com/u/24823322');

  // 下载到 download/images 下，如果文件夹不存在将自动创建
  await download(
    'https://avatars.githubusercontent.com/u/24823322',
    'download/images'
  );

  // 下载到 download/images 下，并将文件命名为 avatar.png
  await download(
    'https://avatars.githubusercontent.com/u/24823322',
    'download/images/avatar.png'
  );

  /**
   * 下载到 download/images 下，并将文件命名为 my-avatar 
   * 扩展名根据 MIME 类型判断生成
   * 当你确定要下载的文件类型，而又想设置文件名城时，可通过此方式实现
   */
  const result = await download(
    'https://avatars.githubusercontent.com/u/24823322',
    'download/images',
    {
      filename: 'my-avatar'
    }
  );

  return result;
}

singleDownload();
