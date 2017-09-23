import { scaleLinear } from 'd3-scale';

import { extent, max, min } from 'd3-array';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isNumber from 'lodash-es/isNumber';

import tickRange from './ticks';

const isValid = d=> !isUndefined(d) && !isNull(d) && isNumber(d);

const updateMetricScale = (data, opt)=> {
    for (const [i, x] of opt.yAxis.entries()) {
        const yList = opt.data.y.filter(d=>d.yAxis === i);
        const rangeList = yList.map(d=> extent(data, datum=> datum[d.accessor]));

        let universalMin = min(rangeList, d=>d[0]);
        let universalMax = max(rangeList, d=>d[1]);

        if (isValid(x.min)) {
            if (x.min > universalMin) {
                console.error('invalid yAxis min: ' + i);
            } else {
                universalMin = x.min;
            }
        }

        if (isValid(x.max)) {
            if (x.max < universalMax) {
                console.error('invalid yAxis min: ' + i);
            } else {
                universalMax = x.max;
            }
        }

        x.min = universalMin;
        x.max = universalMax;
    }


    for (let metric of opt.data.y) {
        metric.yAxis = metric.yAxis || 0;

        if (opt.yAxis.length < metric.yAxis + 1) {
            throw new Error('invalid yAxis definition for data y: ' + metric.accessor)
        }
        
        const axisDef = opt.yAxis[metric.yAxis];
        const range = [axisDef.min, axisDef.max];

        let _tickedRange = tickRange(range, opt.yAxis[metric.yAxis].ticks, opt.yAxis[metric.yAxis].tier);

        metric.ticksMin = _tickedRange[0];
        metric.ticksMax = _tickedRange[1];
        metric.ticksTier = _tickedRange[2];

        metric.min = range[0];
        metric.max = range[1];

        metric.scale = scaleLinear()
            .domain([metric.ticksMin, metric.ticksMax])
            .range([opt.chart.innerHeight, 0]);
    }
};

export default updateMetricScale;