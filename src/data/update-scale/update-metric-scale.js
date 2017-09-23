import { scaleLinear } from 'd3-scale';
import { extent, max, min } from 'd3-array';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isNumber from 'lodash-es/isNumber';

import tickRange from './ticks';


const updateMetricScale = (data, opt)=> {
    for (let metric of opt.data.y) {
        metric.yAxis = metric.yAxis || 0;

        let _range = extent(data, d=> d[metric.accessor]);

        if ( opt.yAxis &&  opt.yAxis.length >= (metric.yAxis + 1)) {
            let _axisDef = opt.yAxis[metric.yAxis];

            if (!isUndefined(_axisDef.min) && !isNull(_axisDef.min) && isNumber(_axisDef.min)) {
                if (_axisDef.min >= _range[0]) {
                    console.log('yAxis[' + metric.yAxis + '] min value is invalid, it shall be smaller than ' + _range[0]);
                } else {
                    _range[0] = _axisDef.min;
                }
            }

            if (!isUndefined(_axisDef.max) && !isNull(_axisDef.max) && isNumber(_axisDef.max)) {
                if (_axisDef.max <= _range[1]) {
                    console.log('yAxis[' + metric.yAxis + '] max value is invalid, it shall be larger than ' + _range[1]);
                } else {
                    _range[1] = _axisDef.max;
                }
            }
        }


        let _tickedRange = tickRange(_range, opt.yAxis[metric.yAxis].ticks, opt.yAxis[metric.yAxis].tier);

        metric.ticksMin = _tickedRange[0];
        metric.ticksMax = _tickedRange[1];
        metric.ticksTier = _tickedRange[2];

        metric.min = _range[0];
        metric.max = _range[1];

        metric.scale = scaleLinear()
            .domain([metric.ticksMin, metric.ticksMax])
            .range([opt.chart.innerHeight, 0]);
    }
};

export default updateMetricScale;