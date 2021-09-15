const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const resolveDest = require('./resolve-dest')
const { getExtByMime } = require('./get-ext');
const getFilename = require('./get-filename');
const { mkdirsSync } = require('./dir');
const size = require('./file-size');

/**
 * @param {string} url 
 * @param {string} dest 
 * @param {*} options 
 */
async function download(url, dest, options = {}) {

  try {
    let {
      filename,
      onDownload = () => { },
      ...AxiosRequestConfig
    } = options;

    let { output, name, ext } = resolveDest(`${dest}`);

    /** @type {import('axios').AxiosResponse<fs.ReadStream>} */
    const res = await axios({
      method: 'get',
      url: url,
      ...AxiosRequestConfig,
      responseType: 'stream',
    });

    const { data, headers } = res;

    const fileSize = headers['content-length'];
    const fileType = headers['content-type'];
    const fileDisposition = headers['content-disposition'];

    filename = filename || name || getFilename(fileDisposition, url);
    let [_filename, _ext] = filename.split('.');
    filename = _filename;
    ext = ext || getExtByMime(fileType) || _ext;

    mkdirsSync(output);

    const outputPath = `${output}/${filename}${ext}`;

    const writer = fs.createWriteStream(`${output}/${filename}${ext}`);

    data.on('data', (chunk) => {
      onDownload(chunk, {
        fileSize,
        output,
        filename,
        ext,
      });
    });
    data.pipe(writer);

    return {
      path: path.resolve(outputPath),
      file: `${filename}${ext}`,
      size: `${size(fileSize, 'B')}`,
    }
  } catch (err) {
    return err;
  }
}

module.exports = download;
