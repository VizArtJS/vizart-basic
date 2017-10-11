const hasNegativeValue = (data, opt)=> {
    let hasNegative = false;

    dataLoop:
        for (const d of data) {
            for (const _y of opt.data.y) {
                if (d[_y.accessor] < 0) {
                    hasNegative = true;
                    break dataLoop;
                }
            }
        }

    return hasNegative;
}

export default hasNegativeValue
