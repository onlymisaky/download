import contentDisposition from 'content-disposition';
import mimeDB from 'mime-db';
import { Obj } from '../types';

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Pragma': 'no-cache',
};

function formatHeaders(headers: Obj): Obj {
  return Object.keys(headers).reduce((header, key) => {
    const name = key.toLowerCase();
    const value = headers[key];
    header[name] = value;
    return header;
  }, {} as Obj);
}

function parseDisposition(disposition: string) {
  let filename = '';
  if (disposition) {
    const parsed = contentDisposition.parse(disposition);
    if (parsed.parameters && parsed.parameters.filename) {
      filename = parsed.parameters.filename;
    }
  }
  return filename;
}

function getExtensionsByMime(mime: string) {
  const mimeEntry = mimeDB[mime];
  if (mimeEntry) {
    const extensions = mimeEntry.extensions;
    return (extensions || []) as string[];
  }
  return [];
}

function resolveResHeaders(resHeaders: Obj) {
  const type = resHeaders['content-type'];
  const extensions = getExtensionsByMime(type);

  const disposition = resHeaders['content-disposition'];
  const filename = parseDisposition(disposition);

  const size = resHeaders['content-length'];
  const acceptRanges = resHeaders['accept-ranges'] as string;

  return {
    extensions,
    filename,
    size,
    acceptRanges,
  }
}

export {
  defaultHeaders,
  formatHeaders,
  resolveResHeaders,
  parseDisposition,
}
