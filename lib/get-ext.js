const mimeDB = require('mime-db');

function getExtByMime(mime) {
  const mimeEntry = mimeDB[mime];
  if (mimeEntry) {
    const extensions = mimeEntry.extensions;
    if (extensions) {
      return `.${extensions[0]}`;
    }
    return '';
  }
  return '';
}

module.exports = {
  getExtByMime,
};
