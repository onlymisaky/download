const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx');
const download = require('../dist/index');
const { index2NO, checkURL, slice } = require('../src/lib/utils');
const { delSync } = require('../src/lib/dir');

function xlsx2JSON() {
  const [{ data }] = xlsx.parse(path.resolve(__dirname, './excel.xlsx'));
  const keys = data.shift();
  return data.reduce((prev, current, index) => {
    const no = index2NO(index, `${data.length}`.length);
    const name = current[0];

    const initRow = { name };

    const row = keys.reduce((o, key, i) => {
      const val = current[i];
      if (checkURL(val)) {
        o[key] = val;
      }
      return o;
    }, initRow);

    prev[no] = row;
    return prev;
  }, {});
}

function log(text) {
  fs.writeFileSync('download/error.json', text);
}

function processTaskResults(tasks, no, name) {
  return Promise.allSettled(tasks)
    .then((result) => {
      const error = result
        .filter((r) => r.status === 'rejected')
        .map((r) => r.reason)
        .reduce((prev, current, index) => {
          prev[no] = {
            name,
            ...prev[no],
            ...current,
          }
          return prev;
        }, {});
      if (JSON.stringify(error) === "{}") {
        return;
      }
      return error;
    });
}

function createPersonTask(no, data) {
  const { name, ...others } = data;
  const tasks = Object.keys(others).map((filename) => {

    let uri = others[filename];
    if (!uri.endsWith('/primary')) {
      uri += '/primary';
    }

    const dest = `download/${no}-${name}`;

    return download(uri, dest, {
      filename: `${name}-${filename}`,
    }).catch(() => Promise.reject({
      [filename]: uri
    }));

  });
  return tasks;
}

function downloadPerson(no, data) {
  const tasks = createPersonTask(no, data);
  return processTaskResults(tasks, no, data.name);
}

function setup() {
  delSync('download');
  const data = xlsx2JSON();
  let error = {};

  slice(Object.keys(data), 10)
    .reduce((prev, nos) => {
      return prev.then(() => {
        const ps = nos.map((no) => {
          return downloadPerson(no, data[no])
            .then((err) => {
              if (err) {
                error = {
                  ...error,
                  ...err,
                }
              }
            });
        });
        return Promise.all(ps);
      })
    }, Promise.resolve([]))
    .then(() => {
      log(JSON.stringify(error, null, '\t'));
    });
}

setup();
