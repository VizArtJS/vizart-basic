import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isNaN from 'lodash-es/isNaN';

const _judgeMax = maxLength => Math.pow(10, maxLength);

const _maxLength = max => {
  if (max >= 1) {
    return Math.round(max).toString().length;
  } else {
    let maxLength = 0;
    while (max < Math.pow(10, maxLength - 1)) {
      maxLength = maxLength - 1;
    }
    return maxLength;
  }
};

// ticks only positive
const _tickPositive = (range, ticks, tier) => {
  let min = 0;
  let max = range[1];
  let adjust = 0.9525;
  let maxTicks = 0;

  if (
    typeof ticks == 'number' &&
    !isNaN(parseInt(ticks)) &&
    isFinite(ticks) &&
    ticks > 0
  ) {
    maxTicks = ticks;
  }

  if (max - min == 0 || (min == 0 && max == 1)) {
    return [min, 1, maxTicks == 0 ? 5 : Math.min(maxTicks, 5)];
  } else if (maxTicks == 1) {
    return [min, max, 1];
  }

  if (
    typeof tier == 'number' &&
    !isNaN(parseFloat(tier)) &&
    isFinite(tier) &&
    tier > 0 &&
    max / tier <= maxTicks
  ) {
    let current = tier;
    let maxRange = range[1];
    let ticks = 1;
    while (true) {
      if (max < adjust * current) {
        maxRange = current;
        break;
      } else {
        current = current + tier;
        ticks = ticks + 1;
      }
    }
    return [min, maxRange, ticks];
  } else {
    let maxLength = _maxLength(max);
    let maxRange = _judgeMax(maxLength);
    let unit = 5;
    let multiplier = 1;

    if (maxTicks == 0) {
      if (max < (adjust * maxRange) / 5) {
        unit = 50;
      } else if (max < (adjust * maxRange) / 2) {
        unit = 20;
      } else if (max < adjust * maxRange) {
        unit = 10;
      }
    } else {
      multiplier = maxTicks;
      unit = Math.pow(10, maxTicks.toString().length);
      if (max < (adjust * maxRange * 2) / unit) {
        unit = unit * 5;
      } else if (max < (adjust * maxRange * 5) / unit) {
        unit = unit * 2;
      }
    }

    let tier = maxRange / unit;
    let current = tier * multiplier;
    let ticks = 1;

    while (true) {
      if (max < adjust * current) {
        maxRange = current;
        break;
      } else {
        current = current + tier * multiplier;
        ticks = ticks + 1;
      }
    }

    if (maxTicks == 0) {
      //control # of ticks to 7 or below
      switch (ticks) {
        case 10:
          ticks = 5;
          break;
        case 9:
          ticks = 3;
          break;
        case 8:
          ticks = 4;
          break;
      }
    } else {
      let minTicks = maxTicks;
      while (max < adjust * (maxRange - tier * ticks)) {
        maxRange = maxRange - tier * ticks;
        minTicks--;
      }
      ticks = minTicks;
    }

    if (maxLength < 0) {
      let precision = Math.pow(10, -1 * maxLength + 2);
      maxRange = Math.round(maxRange * precision) / precision;
    }

    return [min, maxRange, ticks];
  }
};

// contains both positive and negative
const tickBothNegativeAndPositive = (range, ticks, tier) => {
  let adjust = 0.9525;
  let maxTicks = 0;

  if (
    typeof ticks == 'number' &&
    !isNaN(parseInt(ticks)) &&
    isFinite(ticks) &&
    ticks > 0
  ) {
    maxTicks = ticks;
  }
  if (maxTicks == 1) {
    return [range[0], range[1], 1];
  }

  if (
    typeof tier == 'number' &&
    !isNaN(parseFloat(tier)) &&
    isFinite(tier) &&
    tier > 0 &&
    (Math.abs(range[0]) + Math.abs(range[1])) / tier <= maxTicks
  ) {
    let minRange = range[0];
    let current = tier * -1;
    let ticks = 1;
    while (true) {
      if (minRange > adjust * current) {
        minRange = current;
        break;
      } else {
        current = current - tier;
        ticks = ticks + 1;
      }
    }

    let maxRange = range[1];
    current = tier;

    while (true) {
      if (range < adjust * current) {
        maxRange = current;
        break;
      } else {
        current = current + tier;
        ticks = ticks + 1;
      }
    }
    return [minRange, maxRange, ticks];
  } else {
    let absmin = Math.abs(range[0]);
    let min = absmin < range[1] ? absmin : range[1];
    let max = absmin > range[1] ? absmin : range[1];

    let maxLength = _maxLength(max);
    let maxRange = _judgeMax(maxLength);
    let minRange = min;
    let unit = 5;
    let multiplier = 1;

    if (maxTicks == 0) {
      if (max < (adjust * maxRange) / 5) {
        unit = 50;
      } else if (max < (adjust * maxRange) / 2) {
        unit = 20;
      } else if (max < adjust * maxRange) {
        unit = 10;
      }
    } else {
      multiplier = maxTicks;
      unit = Math.pow(10, maxTicks.toString().length);
      if (max < (adjust * maxRange * 2) / unit) {
        unit = unit * 5;
      } else if (max < (adjust * maxRange * 5) / unit) {
        unit = unit * 2;
      }
    }

    let tier = maxRange / unit;
    let current = tier * multiplier;
    let ticks = 1;

    while (true) {
      if (max < adjust * current) {
        maxRange = current;
        break;
      } else {
        current = current + tier * multiplier;
        ticks = ticks + 1;
      }
    }

    //calculate min
    current = tier * multiplier;
    while (true) {
      if (min < adjust * current) {
        minRange = current;
        break;
      } else {
        current = current + tier * multiplier;
        ticks = ticks + 1;
      }
    }

    if (maxTicks > 0) {
      let minTicks = maxTicks;
      while (max < adjust * (maxRange - tier * ticks)) {
        maxRange = maxRange - tier * ticks;
        minTicks--;
      }
      while (min < adjust * (minRange - tier * ticks)) {
        minRange = minRange - tier * ticks;
        minTicks--;
      }
      ticks = minTicks;
    }

    return absmin < range[1]
      ? [minRange * -1, maxRange, ticks]
      : [maxRange * -1, minRange, ticks];
  }
};

const tickRange = (range, ticks, tier) => {
  if (
    range.length == 0 ||
    isUndefined(range[0]) ||
    isNull(range[0]) ||
    isNaN(range[0]) ||
    isUndefined(range[1]) ||
    isNull(range[1]) ||
    isNaN(range[1])
  ) {
    return [0, 1];
  } else if (range[0] >= 0) {
    //positive chart, adjust max scale only
    return _tickPositive(range, ticks, tier);
  } else if (range[1] <= 0) {
    //pure negative scale, we can use the position scale just reverse it
    let scale = _tickPositive([range[1] * -1, range[0] * -1], ticks, tier);
    return [scale[1] * -1, scale[0] * -1];
  } else {
    //mixed scale
    return tickBothNegativeAndPositive(range, ticks, tier);
  }
};

export default tickRange;
