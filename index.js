const down = require('./lib/download');
const { getType, slice } = require('./lib/utils');

function download(urls, dests, options = {}) {
  let { count, ...opts } = options;

  let dest = '.';
  let type = getType(dests);
  if (['string', 'number'].includes(type)) {
    dest = dests;
  }

  if (getType(urls) === 'string') {
    return down(urls, dest, opts);
  }

  count = count || urls.length - 1;

  const promise = slice(urls, count).reduce((prev, current, taskIdx) => {
    return prev.then((prevResult) => {
      const tasks = current.map((url, urlIdx) => {

        let index = taskIdx * count + urlIdx;
        if (type === 'array') {
          dest = dests[index];
        }
        if (type === 'function') {
          dest = dests(index, urls[index]);
        }

        return down(url, dest, opts);
      });
      return Promise.allSettled(tasks).then((result) => {
        return [
          ...prevResult,
          ...result,
        ]
      })
    });
  }, Promise.resolve([]));

  return promise;
}

module.exports = download;
