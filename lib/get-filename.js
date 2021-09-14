const path = require('path');
const contentDisposition = require('content-disposition');

/**
 * @param {string} disposition 
 * @param {string} requestUrl 
 * @returns 
 */
function getFilename(disposition, requestUrl) {
  let filename = '';

  if (disposition) {
    const parsed = contentDisposition.parse(disposition);
    if (parsed.parameters && parsed.parameters.filename) {
      filename = parsed.parameters.filename;
    }
  }

  if (!filename) {
    filename = path.basename(new URL(requestUrl).pathname)
  }

  return filename;
}

module.exports = getFilename;

