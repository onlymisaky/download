import { del, delSync, delPromise } from '../src/lib/dir';


function clearCache() {
  delSync('24823322.png');
  del(`download/images/avatar.png`, () => {
    delPromise('download/images/my-avatar.png').then(() => {
      return delSync('download/images/24823322.png');
    }).then(() => {
      return delSync('download/images/avatars');
    }).then(() => {
      del('download/images', () => {
        delPromise('download/videos').then(() => {
          return delSync('download')
        })
      })
    })
  })
}

clearCache();
