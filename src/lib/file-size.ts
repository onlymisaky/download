const units = ['B', 'KB', 'MB', 'GB'];

type Unit = 'B' | 'KB' | 'MB' | 'GB';

type Round = {
  size: number,
  unit: Unit,
};

function round(size: number, unit: Unit): Round {
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

  return round(nearSize, nearUnit as Unit);
}

class Size {

  size: number;
  unit: Unit;

  constructor(size: number, unit: Unit) {
    this.size = size;
    this.unit = unit;
  }

  get round() {
    return round(this.size, this.unit);
  }

  toString(fractionDigits?: number) {
    const { size, unit } = this.round;
    if (typeof fractionDigits === 'number') {
      return `${size.toFixed(fractionDigits)}${unit}`;
    }
    return `${size}${unit}`;
  }


  converter(targetUnit: Unit) {
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

function size(size: number, unit: Unit) {
  return new Size(size * 1, unit);
}

export default size;

export {
  size,
  Size,
};
