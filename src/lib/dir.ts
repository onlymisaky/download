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

export {
  mkdirsSync,
  mkdirs,
  mkdirsPromise,
  delSync,
  del,
  delPromise,
}
