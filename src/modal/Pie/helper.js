import { merge, ascending } from 'd3-array';
import { set } from 'd3-collection';

let mergeWithFirstEqualZero = function(first, second) {
    let secondSet = set();
    second.forEach((d) => {
        secondSet.add(this._getDimensionVal(d));
    });

    let _dim = this._getDimension().accessor;
    let _met = this._getMetric().accessor;

    let onlyFirst = first
        .filter((d) => {
            return !secondSet.has(this._getDimensionVal(d))
        })
        .map((d) => {
            let _d = {};
            _d[_dim] = this._getDimensionVal(d);
            _d[_met] = 0;

            return _d;
        });

    return merge([second, onlyFirst])
        .sort((a, b) => {
            return ascending(this._getDimensionVal(a), this._getDimensionVal(b));
        });
}


let limitSliceValues = function() {
    let maxTicks = this._options.xAxis.ticks > 0 ? this._options.xAxis.ticks : 31;
    let maxLength = this._data.length;
    let lastSmall = false;
    let noTwoSmalls = true;
    let maxData;

    if (maxLength > maxTicks) {
        let maxIndividual = maxTicks - 1;
        let etcTotal = 0;
        let i;

        maxData = new Array();

        for (i = 0; i < maxIndividual; ++i) {
            maxData[i] = this._data[i];
            if (noTwoSmalls) {
                if (this._getMetricVal(this._data[i]) / this.total < this.minPct) {
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
            etcTotal += this._getMetricVal(this._data[i]);
        }

        let etc = {};
        etc[this._getDimension().accessor] = this._options.plots.othersTitle;
        etc[this._getMetric().accessor] = etcTotal;
        maxData[maxIndividual] = etc;

        if (lastSmall && etcTotal / this.total < this.minPct) {
            noTwoSmalls = false;
        }

    } else {
        for (let i = 0; i < maxLength; ++i) {
            if (noTwoSmalls) {
                if (this._getMetricVal(this._data[i]) / this.total < this.minPct) {
                    if (lastSmall) {
                        noTwoSmalls = false;
                    }
                    lastSmall = true;
                } else {
                    lastSmall = false;
                }
            }
        }
        maxData = this._data;
    }

    this.consecutiveSmalls = !noTwoSmalls;

    return maxData;
}

export {
    mergeWithFirstEqualZero,
    limitSliceValues
}