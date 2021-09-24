import { getExtensionsByMime, parseDisposition } from "./get-output";
import { Obj } from "./utils";

function formatHeaders(headers: Obj): Obj {
  return Object.keys(headers).reduce((header, key) => {
    const name = key.toLowerCase();
    const value = headers[key];
    header[name] = value;
    return header;
  }, {} as Obj);
}

function resolveResHeaders(resHeaders: Obj) {
  const type = resHeaders['content-type'];
  const extensions = getExtensionsByMime(type);

  const disposition = resHeaders['content-disposition'];
  const filename = parseDisposition(disposition);

  let range = (resHeaders['content-range'] || 'bytes /').toLowerCase();
  range = range.replace('bytes', '').trim();
  const arr = range.split('/');
  const [rangeStart, rangeEnd] = arr[0].split('-');
  let size = arr[1];

  const length = resHeaders['content-type'];

  return {
    extensions,
    filename,
    rangeStart,
    rangeEnd,
    size,
    length,
  }
}

export {
  formatHeaders,
  resolveResHeaders,
}
