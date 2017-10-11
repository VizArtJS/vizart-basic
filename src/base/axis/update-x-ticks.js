import isTickDiv from './is-tick-div';

const updateXAxisTicks = (data, opt, xAxis)=> {
    const getDimensionVal = d => d[opt.data.x.accessor];

    let maxTicks = opt.xAxis.ticks > 0 ? opt.xAxis.ticks : 31;
    if (data.length <= maxTicks) {
        xAxis.ticks(data.length);
        return;
    }

    let units = 10;
    if (maxTicks <= 10) {
        units = maxTicks;
        while (units > 1) { //minimum 1
            if (isTickDiv(data, units)) {
                break;
            }
            --units;
        }
    } else {
        if (isTickDiv(5)) {
            units = isTickDiv(data, 10) ? 10 : 5;
        } else if (isTickDiv(data, 7)) {
            units = 7;
        } else if (isTickDiv(data, 8)) {
            units = 8;
        } else if (isTickDiv(data, 9)) {
            units = 9;
        } else if (isTickDiv(data, 11)) {
            units = 11;
        } else if (maxTicks >= 12 && isTickDiv(data, 12)) {
            units = 12;
        } else if (maxTicks >= 13 && isTickDiv(data, 13)) {
            units = 13;
        } else if (isTickDiv(data, 6)) {
            units = 6;
        }
        //use default here
    }

    if (units > 1) {
        let current = 0;
        let index = 0;
        let lastIndex = data.length - 1;
        let increment = Math.floor((data.length - 1) / units);
        let arr = new Array(units + (isTickDiv(data, units) ? 1 : 2));

        while (current < lastIndex) {
            arr[index++] = getDimensionVal(data[current]);
            current += increment;
        }
        arr[index] = getDimensionVal(data[lastIndex]);
        xAxis.tickValues(arr);
    } else {
        xAxis.ticks(null);
    }
}

export default updateXAxisTicks;