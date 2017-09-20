const limitSliceValues = (data, opt, total, minPct)=> {
    let maxTicks = opt.xAxis.ticks > 0 ? opt.xAxis.ticks : 31;
    let maxLength = data.length;
    let lastSmall = false;
    let noTwoSmalls = true;
    let maxData;

    if (maxLength > maxTicks) {
        let maxIndividual = maxTicks - 1;
        let etcTotal = 0;
        let i;

        maxData = new Array();

        for (i = 0; i < maxIndividual; ++i) {
            maxData[i] = data[i];
            if (noTwoSmalls) {
                if (data[i].y / total < minPct) {
                    if (lastSmall) {
                        noTwoSmalls = false;
                    }
                    lastSmall = true;
                } else {
                    lastSmall = false;
                }
            }
        }

        for (i = maxIndividual; i < maxLength; ++i) {
            etcTotal += data[i].y;
        }

        maxData[maxIndividual] = {
            x: opt.plots.othersTitle,
            y: etcTotal
        };

        if (lastSmall && etcTotal / total < minPct) {
            noTwoSmalls = false;
        }

    } else {
        for (let i = 0; i < maxLength; ++i) {
            if (noTwoSmalls) {
                if (data[i].y / total < minPct) {
                    if (lastSmall) {
                        noTwoSmalls = false;
                    }
                    lastSmall = true;
                } else {
                    lastSmall = false;
                }
            }
        }
        maxData = data;
    }

    // this.consecutiveSmalls = !noTwoSmalls;

    return maxData;
}

export default limitSliceValues;