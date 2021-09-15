const units = ['B', 'KB', 'MB', 'GB'];

/**
 * @param {number} size
 * @param {'B'|'KB'|'MB'|'GB'} unit
 * @returns {{size: number, unit: 'B'|'KB'|'MB'|'GB'}}
 */
function round(size, unit) {
  if (size >= 1 && size < 1024) {
    return { size, unit };
  }

  const index = units.indexOf(unit);
  let nearUnit = '';
  let nearSize = size;
  if (size < 1) {
    nearUnit = units[index - 1];
    nearSize = size * 1024;
  }
  if (size >= 1024) {
    nearUnit = units[index + 1];
    nearSize = size / 1024;
  }

  if (!nearUnit) {
    return { size, unit };
  }

  return round(nearSize, nearUnit);
}

class Size {
  /** 
   * @param {number} size 
   * @param {'B'|'KB'|'MB'|'GB'} unit 
   */
  constructor(size, unit) {
    this.size = size;
    this.unit = unit;
  }

  get round() {
    return round(this.size, this.unit);
  }

  toString(fractionDigits) {
    const { size, unit } = this.round;
    if (typeof fractionDigits === 'number') {
      return `${size.toFixed(fractionDigits)}${unit}`;
    }
    return `${size}${unit}`;
  }

  /**
   * @param {'B'|'KB'|'MB'|'GB'} targetUnit 
   * @returns {number}
   */
  converter(targetUnit) {
    if (this.unit === targetUnit) {
      return this.size;
    }
    const { size, unit } = this.round;
    const index1 = units.indexOf(targetUnit);
    const index2 = units.indexOf(unit);
    const n = index2 - index1;
    const multiplier = Math.pow(2, 10 * n)
    return size * multiplier;
  }

  get B() {
    return this.converter('B');
  }

  get KB() {
    return this.converter('KB');
  }

  get MB() {
    return this.converter('MB');
  }

  get GB() {
    return this.converter('GB');
  }

}

/**
 * @param {number} size
 * @param {'B'|'KB'|'MB'|'GB'} unit
 * @returns {Size}
 */
function size(size, unit) {
  return new Size(size, unit);
}

module.exports = size;
