import * as fs from 'fs';
import * as path from 'path';

function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true;
  }
  if (mkdirsSync(path.dirname(dirname))) {
    fs.mkdirSync(dirname);
    return true;
  }
  return true;
}

function mkdirs(dirname: string, callback: fs.NoParamCallback = () => { }) {
  if (fs.existsSync(dirname)) {
    callback(null);
  } else {
    mkdirs(path.dirname(dirname), () => {
      fs.mkdir(dirname, callback);
    });
  }
}

function mkdirsPromise(dirname: string) {
  return new Promise<void>((resolve, reject) => {
    mkdirs(dirname, (err) => {
      if (err) {
        return reject(err)
      }
      return resolve();
    });
  });
}

function delSync(path: fs.PathLike) {
  if (fs.existsSync(path)) {
    if (fs.statSync(path).isDirectory()) {
      let files = fs.readdirSync(path);
      files.forEach((file) => {
        let currentPath = `${path}/${file}`;
        if (fs.statSync(currentPath).isDirectory()) {
          delSync(currentPath);
        } else {
          fs.unlinkSync(currentPath);
        }
      });
      fs.rmdirSync(path);
      return true;
    } else {
      fs.unlinkSync(path);
      return true;
    }
  }
  return true;
}

function del(path: fs.PathLike, callback: fs.NoParamCallback = () => { }) {
  if (fs.existsSync(path)) {
    fs.stat(path, (err, stat) => {
      if (err) {
        callback(err);
      } else {
        if (stat.isDirectory()) {
          fs.readdir(path, (err, files) => {
            if (err) {
              callback(err)
            } else {
              if (files.length === 0) {
                fs.rmdir(path, callback);
              }
              let count = 0;
              files.forEach((file) => {
                let currentPath = `${path}/${file}`;
                fs.stat(currentPath, (err, currentStat) => {
                  if (err) {
                    callback(err);
                  } else {
                    if (currentStat.isDirectory()) {
                      del(currentPath, (err) => {
                        if (err) {
                          callback(err);
                        } else {
                          count++;
                          if (count === files.length) {
                            fs.rmdir(path, callback);
                          }
                        }
                      });
                    } else {
                      fs.unlink(currentPath, (err) => {
                        if (err) {
                          callback(err);
                        } else {
                          count++;
                          if (count === files.length) {
                            fs.rmdir(path, callback);
                          }
                        }
                      });
                    }
                  }
                });
              });
            }
          });
        }
        else {
          fs.unlink(path, callback);
        }
      }
    });
  } else {
    callback(null);
  }
}

function delPromise(path: fs.PathLike) {
  return new Promise<void>((resolve, reject) => {
    del(path, (err) => {
      if (err) {
        return reject(err)
      }
      return resolve();
    });
  });
}

// https://www.google.com.hk/search?q=node+stream+%E5%90%88%E5%B9%B6%E6%96%87%E4%BB%B6&newwindow=1&biw=1920&bih=969&ei=j05VYfvQBoKB-Ab-15e4DQ&oq=node+stream+%E5%90%88%E5%B9%B6%E6%96%87%E4%BB%B6&gs_lcp=Cgdnd3Mtd2l6EAMyBQghEKABOggIABCwAxDNAjoFCAAQgAQ6BAgAEEM6BwgAEIAEEAw6BAgAEB46BggAEAgQHjoGCAAQChAeOgcIIRAKEKABSgQIQRgBUKW_BFjmgwVg4IYFaApwAHgBgAG8A4gBry2SAQowLjE5LjcuMi4xmAEAoAEByAEBwAEB&sclient=gws-wiz&ved=0ahUKEwi71Nzv_qXzAhWCAN4KHf7rBdc4ChDh1QMIDg&uact=5
// https://blog.csdn.net/qfluohao/article/details/105737160
function mergeStream(
  sources: fs.PathLike[],
  writeStream: fs.WriteStream,
  callback: fs.NoParamCallback = () => { }
) {
  if (sources.length === 0) {
    writeStream.end();
    callback(null);
    return
  }
  const readStream = fs.createReadStream(sources.shift() as fs.PathLike);
  readStream.pipe(writeStream, { end: false });
  // todo
  writeStream.on('finish', () => {
    mergeStream(sources, writeStream);
  });
  readStream.on('error', (err) => {
    readStream.close();
    writeStream.close();
    callback(err);
  });
  writeStream.on('error', (err) => {
    readStream.close();
    writeStream.close();
    callback(err);
  });
}

function joinFile(
  sources: fs.PathLike[],
  target: fs.PathLike,
  callback: fs.NoParamCallback = () => { }
) {
  const writeStream = fs.createWriteStream(target);
  // todo
  writeStream.on('error', (err) => {
    writeStream.close();
    delSync(target);
    callback(err);
  });
  mergeStream(sources, writeStream, callback)
}

export {
  mkdirsSync,
  mkdirs,
  mkdirsPromise,
  delSync,
  del,
  delPromise,
  joinFile,
};
