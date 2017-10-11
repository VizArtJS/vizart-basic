import isTickDiv from './is-tick-div';

const updateXAxisTicks = (_data, opt, xAxis)=> {
    const getDimensionVal = d => d[opt.data.x.accessor];

    let maxTicks = opt.xAxis.ticks > 0 ? opt.xAxis.ticks : 31;
    if (_data.length <= maxTicks) {
        xAxis.ticks(_data.length);
        return;
    }

    let units = 10;
    if (maxTicks <= 10) {
        units = maxTicks;
        while (units > 1) { //minimum 1
            if (isTickDiv(_data, units)) {
                break;
            }
            --units;
        }
    } else {
        if (isTickDiv(5)) {
            units = isTickDiv(_data, 10) ? 10 : 5;
        } else if (isTickDiv(_data, 7)) {
            units = 7;
        } else if (isTickDiv(_data, 8)) {
            units = 8;
        } else if (isTickDiv(_data, 9)) {
            units = 9;
        } else if (isTickDiv(_data, 11)) {
            units = 11;
        } else if (maxTicks >= 12 && isTickDiv(_data, 12)) {
            units = 12;
        } else if (maxTicks >= 13 && isTickDiv(_data, 13)) {
            units = 13;
        } else if (isTickDiv(_data, 6)) {
            units = 6;
        }
        //use default here
    }

    if (units > 1) {
        let current = 0;
        let index = 0;
        let lastIndex = _data.length - 1;
        let increment = Math.floor((_data.length - 1) / units);
        let arr = new Array(units + (isTickDiv(_data, units) ? 1 : 2));

        while (current < lastIndex) {
            arr[index++] = getDimensionVal(_data[current]);
            current += increment;
        }
        arr[index] = getDimensionVal(_data[lastIndex]);
        xAxis.tickValues(arr);
    } else {
        xAxis.ticks(null);
    }
}

export default updateXAxisTicks;