const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const resolveDest = require('./resolve-dest')
const { getExtByMime } = require('./get-ext');
const getFilename = require('./get-filename');
const { mkdirsSync } = require('./dir');
const sizeFormat = require('./file-size');

/**
 * @param {string} url 
 * @param {string} dest 
 * @param {*} options 
 */
async function download(url, dest, options = {}) {

  try {
    let {
      filename,
      onStartDownload = () => { },
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

    const fileType = headers['content-type'];
    const fileDisposition = headers['content-disposition'];

    filename = filename || name || getFilename(fileDisposition, url);
    let [_filename, _ext] = filename.split('.');
    filename = _filename;
    ext = ext || getExtByMime(fileType) || _ext;

    mkdirsSync(output);

    const outputPath = `${output}/${filename}${ext}`;

    const writer = fs.createWriteStream(`${output}/${filename}${ext}`);

    const contentLength = headers['content-length'];
    const fileSize = sizeFormat(contentLength, 'B');

    const result = {
      path: path.resolve(outputPath),
      file: `${filename}${ext}`,
      size: `${fileSize}`,
    };

    const ctx = {
      ...result,
      size: fileSize,
      downloaded: 0,
      response: res,
      stream: writer,
    };

    // 通过 onStartDownload 创建自定义上下文，将该对象暴露给 onDownload
    let customCtx = onStartDownload(ctx);

    // TODO onData 结束，是否也表示写入完成了？
    data.on('data', (chunk) => {
      ctx.downloaded += chunk.length;
      onDownload(chunk, ctx, customCtx);
    });
    data.pipe(writer);

    return new Promise((resolve, reject) => {
      data.on('error', (err) => {
        reject(err);
      });

      writer.on('error', (err) => {
        reject(err);
      });

      writer.on('finish', () => {
        resolve(result);
      });
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

module.exports = download;
