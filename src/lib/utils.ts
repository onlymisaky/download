export interface Obj {
  [key: string]: any
}

function slice<T>(arr: T[], count: number): T[][] {
  const result = [];
  for (var i = 0; i < arr.length; i += count) {
    result.push(arr.slice(i, i + count))
  }
  return result;
}

function hasOwn(obj: any, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function toString(obj: any) {
  return Object.prototype.toString.call(obj);
}

function getType(v: any) {
  return toString(v).slice(8, -1).toLowerCase();
}

function index2NO(index: number, length: number) {
  let str = `${index + 1}`;
  let len = length - str.length;
  for (var i = 0; i < len; i++) {
    str = `0${str}`;
  }
  return str;
}

function checkURL(url: string) {
  return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(url);
}

/**
 * split(`file.ext1.ext`, '.', 'last')  ==>   ['file.ext1', 'ext']
 * split(`file.ext1.ext`, '.', '2')     ==>   ['file.ext1', 'ext']
 * split(`file.ext1.ext`, '.', '1')     ==>   ['file', 'ext1.ext']
 */
function split(str: string, separator: string, index: number | 'last'): [string, string] {
  const arr = str.split(separator);
  const len = arr.length;
  if (len === 1 || index <= 0 || index > len - 1) {
    return [str, ''];
  }
  if (index === 'last') {
    index = len - 1;
  }
  return [
    arr.slice(0, index).join(separator),
    arr.slice(index).join(separator),
  ]
}

export {
  slice,
  hasOwn,
  toString,
  getType,
  index2NO,
  checkURL,
  split,
};
