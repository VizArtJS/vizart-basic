const labelPrecision = (_max, _min, _levels)=> {
    if (_levels <= 1) {
        return 0;
    }

    let ticks = _levels - 1;
    let precision = 0;
    let max = Math.max(Math.abs(_max), Math.abs(_min));

    if ( max >= 1 ) {
        if (max != Math.round(max / ticks) * ticks) {
            precision = ticks.toString().length;
        }
    } else {
        let maxLength = 0;
        while (max < Math.pow(10, maxLength - 1)) {
            maxLength = maxLength - 1;
        }
        precision = -1 * maxLength + ticks.toString().length + 1;
    }
    return precision;
}

export default labelPrecision;