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

  count = urls.length;

  const promise = slice(urls, count).reduce((prev, current, taskIdx) => {
    return prev.then(() => {
      const tasks = current.map((url, urlIdx) => {

        let index = taskIdx * count + urlIdx;
        if (type === 'array') {
          dest = dests[index];
        }
        if (type === 'function') {
          dest = dests(index, urls[index]);
        }

        down(url, dest, opts);
      });
      return Promise.allSettled(tasks);
    });
  }, Promise.resolve());

  return promise;
}

module.exports = download;
