import { sum } from 'd3-array';
import { format } from 'd3-format';

const percentFormat = format(".00%");

const limitSliceValues = (data, opt, color)=> {
    const minPct = opt.plots.labelMinPercentage;
    const total = sum(data, d=>d.y);

    let maxTicks = opt.xAxis.ticks > 0 ? opt.xAxis.ticks : 31;
    let maxLength = data.length;
    let lastSmall = false;
    let noTwoSmalls = true;
    let maxData;

    if (minPct === 0) {
        maxData = data;
    }


    if (maxLength > maxTicks) {
        let maxIndividual = maxTicks - 1;
        let etcTotal = 0;
        let etcData = [];
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
            etcData.push(data[i]);
        }

        maxData[maxIndividual] = {
            x: opt.plots.othersTitle,
            y: etcTotal,
            c: color(etcTotal),
            alpha: opt.plots.opacity,
            data: etcData,
            label: opt.plots.othersTitle
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

    for (let d of maxData) {
        d.p = percentFormat(d.y / total);
    }

    return maxData;
}

export default limitSliceValues;