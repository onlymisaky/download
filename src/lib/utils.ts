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

export {
  slice,
  hasOwn,
  toString,
  getType,
  index2NO,
  checkURL,
};
