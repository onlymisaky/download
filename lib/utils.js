/**
 * @param {array[]} arr 
 * @param {number} count 
 * @returns {array[]}
 */
function slice(arr, count) {
  const result = [];
  for (var i = 0; i < arr.length; i += count) {
    result.push(arr.slice(i, i + count))
  }
  return result;
}

/** 
 * @param {any} obj 
 * @param {string} key 
 * @returns {boolean}
 */
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** 
 * @param {any} obj 
 * @returns {string}
 */
function toString(obj) {
  return Object.prototype.toString.call(obj);
}

/** 
 * @param {any} v 
 * @returns {string}
 */
function getType(v) {
  return toString(v).slice(8, -1).toLowerCase();
}

function index2NO(index, length) {
  let str = `${index + 1}`;
  let len = length - str.length;
  for (var i = 0; i < len; i++) {
    str = `0${str}`;
  }
  return str;
}

function checkURL(url) {
  return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(url);
}

module.exports = {
  slice,
  hasOwn,
  toString,
  getType,
  index2NO,
  checkURL,
};
