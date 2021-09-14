```js
const download = require('../index');
const { del } = require('../lib/dir');

del('download/_avatars', (err) => {
  if (err) {
    console.log(err);
    return;
  }

  // 下载一个文件，并指定路径名称和扩展名
  download('https://avatars.githubusercontent.com/u/24823322', 'download/_avatars/my-avatars.png');

  const ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 下载多个文件到指定目录 
  download(
    ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`),
    'download/_avatars'
  );

  // 下载多个文件到对应目录
  download(
    ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`),
    ids.map((id) => `download/_avatars/${id}`)
  );

  // 分批下载多个文件，并指定路径名称和扩展名
  download(
    ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`),
    (index, url) => `download/_avatars/avatar${index}.png`,
    { count: 2 }
  );
});

```
