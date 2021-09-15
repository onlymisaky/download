const download = require('../index');
const { del } = require('../lib/dir');

del('download/_avatars', (err) => {
  if (err) {
    console.log(err);
    return;
  }

  download(
    'https://avatars.githubusercontent.com/u/24823322',
    'download/_avatars/my-avatars.png'
  ).then((result) => {
    console.log(result);
  });

  const ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  download(
    ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`),
    'download/_avatars'
  );

  download(
    ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`),
    ids.map((id) => `download/_avatars/${id}`)
  );

  download(
    ids.map((id) => `https://avatars.githubusercontent.com/u/${id}`),
    (index, url) => `download/_avatars/avatar${index}.png`,
    { count: 1 }
  ).then((res) => {
    console.log(res);
  });
});
