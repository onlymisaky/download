import * as path from 'path';
import contentDisposition from 'content-disposition';

function getFilename(disposition: string, requestUrl: string) {
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

export default getFilename;

