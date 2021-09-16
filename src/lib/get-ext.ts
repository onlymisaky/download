import mimeDB from 'mime-db';

function getExtByMime(mime: string) {
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

export default getExtByMime;
