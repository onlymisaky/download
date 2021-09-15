import download from '../src/index';

async function multipleDownloads() {
  const ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const links = ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`);

  // 所有文件会下载到 download/images/avatars
  await download(
    links,
    'download/images/avatars'
  );

  // 下载链接数组与 dest 目录数组一一相对应
  // 0.png 下载到 download/images/avatars/0/0.png
  // 1.png 下载到 download/images/avatars/1/1.png
  await download(
    links,
    ids.map((id) => `download/images/avatars/${id}`),
  );

  // 通过函数创建下载目录
  const result = await download(
    links,
    (index, url) => `download/images/avatars/${index}-avatar.png`
  );

  return result;
}

multipleDownloads();
