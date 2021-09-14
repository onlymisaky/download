const path = require('path');

/**
 * @param {string} dest 
 */
function resolveDest(dest) {
  let [output, ext] = dest.split('.');
  let name = '';
  if (ext) {
    ext = `.${ext}`;
    let arr = output.split('/');
    if (arr.length === 1) {
      name = output;
      output = '';
    } else {
      name = arr[arr.length - 1];
      output = arr.slice(0, arr.length - 1).join('/')
    }
  } else {
    ext = '';
    output = dest;
  }

  output = output || '.';

  return {
    output,
    name,
    ext,
  }
}

module.exports = resolveDest;
