import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isNaN from 'lodash-es/isNaN';

let _judgeMax = function(_maxLength) {
    return Math.pow(10, _maxLength);
}

let _maxLength = function(_max) {
    if ( _max >= 1 ) {
        return Math.round(_max).toString().length;
    } else {
        let maxLength = 0;
        while (_max < Math.pow(10, maxLength - 1)) {
            maxLength = maxLength - 1;
        }
        return maxLength;
    }
}

// ticks only positive
let _tickPositive = function(_range, _ticks, _tier) {
    let min = 0;
    let max = _range[1];
    let adjust = 0.9525; 
    let maxTicks = 0;

    if (typeof _ticks == 'number' 
        && !isNaN(parseInt(_ticks)) 
        && isFinite(_ticks) 
        && _ticks > 0) {
        maxTicks = _ticks;
    }

    if (max - min == 0 || (min == 0 && max == 1)) {
        return [min, 1, maxTicks == 0 ? 5 : Math.min(maxTicks, 5)];
    } else if (maxTicks == 1) {
        return [min, max, 1];
    }

    if (typeof _tier == 'number' 
        && !isNaN(parseFloat(_tier)) 
        && isFinite(_tier) 
        && _tier > 0
        && max / _tier <= maxTicks) {
        let current = _tier;
        let maxRange = _range[1];
        let ticks = 1;
        while (true) {
            if (max < adjust * current) {
                maxRange = current;
                break;
            } else {
                current = current + _tier;
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
            if (max < adjust * maxRange / 5) {
                unit = 50;
            } else if (max < adjust * maxRange / 2) {
                unit = 20;
            } else if (max < adjust * maxRange) {
                unit = 10;
            } 
        } else {
            multiplier = maxTicks;
            unit = Math.pow(10, maxTicks.toString().length);
            if (max < adjust * maxRange * 2 / unit) {
                unit = unit * 5;
            } else if (max < adjust * maxRange * 5 / unit) {
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
            switch(ticks) {
                case 10: ticks = 5; break;
                case 9: ticks = 3; break;
                case 8: ticks = 4; break;
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
}

// contains both positive and negative
let tickBothNegativeAndPositive = function(_range, _ticks, _tier) {
    let adjust = 0.9525; 
    let maxTicks = 0;

    if (typeof _ticks == 'number' 
        && !isNaN(parseInt(_ticks)) 
        && isFinite(_ticks) 
        && _ticks > 0) {
        maxTicks = _ticks;
    }
    if (maxTicks == 1) {
        return [_range[0], _range[1], 1];
    }

    if (typeof _tier == 'number' 
        && !isNaN(parseFloat(_tier)) 
        && isFinite(_tier) 
        && _tier > 0
        && (Math.abs(_range[0]) + Math.abs(_range[1])) / _tier <= maxTicks) {
        let minRange = _range[0];
        let current = _tier * -1;
        let ticks = 1;
        while (true) {
            if (minRange > adjust * current) {
                minRange = current;
                break;
            } else {
                current = current - _tier;
                ticks = ticks + 1;
            }
        }

        let maxRange = _range[1];
        current = _tier;
        
        while (true) {
            if (range < adjust * current) {
                maxRange = current;
                break;
            } else {
                current = current + _tier;
                ticks = ticks + 1;
            }
        }
        return [minRange, maxRange, ticks];
    } else {
        let absmin = Math.abs(_range[0]);
        let min = absmin < _range[1] ? absmin : _range[1];
        let max = absmin > _range[1] ? absmin : _range[1];

        let maxLength = _maxLength(max);
        let maxRange = _judgeMax(maxLength);
        let minRange = min;
        let unit = 5;
        let multiplier = 1;

        if (maxTicks == 0) {
            if (max < adjust * maxRange / 5) {
                unit = 50;
            } else if (max < adjust * maxRange / 2) {
                unit = 20;
            } else if (max < adjust * maxRange) {
                unit = 10;
            } 
        } else {
            multiplier = maxTicks;
            unit = Math.pow(10, maxTicks.toString().length);
            if (max < adjust * maxRange * 2 / unit) {
                unit = unit * 5;
            } else if (max < adjust * maxRange * 5 / unit) {
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

        return absmin < _range[1] ? [minRange * -1, maxRange, ticks] : [maxRange * -1, minRange, ticks] ;
    }
}

const tickRange = (_range, _ticks, _tier)=> {
    if (_range.length == 0
        || isUndefined(_range[0])
        || isNull(_range[0])
        || isNaN(_range[0])
        || isUndefined(_range[1])
        || isNull(_range[1])
        || isNaN(_range[1])) {
        return [0, 1];
    } else if (_range[0] >= 0) {
        //positive chart, adjust max scale only
        return _tickPositive(_range, _ticks, _tier);
    } else if (_range[1] <= 0) {
        //pure negative scale, we can use the position scale just reverse it
        let scale = _tickPositive([_range[1] * -1, _range[0] * -1], _ticks, _tier);
        return [scale[1] * -1, scale[0] * -1];
    } else {
        //mixed scale
        return tickBothNegativeAndPositive(_range, _ticks, _tier);
    }
}

export default tickRange

