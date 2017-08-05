import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

import tickRange from './ticks';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isNumber from 'lodash-es/isNumber';

const metricScale = (_data, _options)=> {
    for (let _metric of _options.data.y) {
        _metric.yAxis = _metric.yAxis || 0;

        let _range = extent(_data, d=> d[_metric.accessor]);

        if ( _options.yAxis &&  _options.yAxis.length >= (_metric.yAxis + 1)) {
            let _axisDef = _options.yAxis[_metric.yAxis];

            if (!isUndefined(_axisDef.min) && !isNull(_axisDef.min) && isNumber(_axisDef.min)) {
                if (_axisDef.min >= _range[0]) {
                    console.log('yAxis[' + _metric.yAxis + '] min value is invalid, it shall be smaller than' + _range[0]);
                } else {
                    _range[0] = _axisDef.min;
                }
            }

            if (!isUndefined(_axisDef.max) && !isNull(_axisDef.max) && isNumber(_axisDef.max)) {
                if (_axisDef.max <= _range[1]) {
                    console.log('yAxis[' + _metric.yAxis + '] max value is invalid, it shall be larger than' + _range[1]);
                } else {
                    _range[1] = _axisDef.max;
                }
            }
        }


        let _tickedRange = tickRange(_range, _options.yAxis[_metric.yAxis].ticks, _options.yAxis[_metric.yAxis].tier);

        _metric.ticksMin = _tickedRange[0];
        _metric.ticksMax = _tickedRange[1];
        _metric.ticksTier = _tickedRange[2];

        _metric.min = _range[0];
        _metric.max = _range[1];

        _metric.scale = scaleLinear()
            .domain([_metric.ticksMin, _metric.ticksMax])
            .range([_options.chart.innerHeight, 0]);
    }
};

export default metricScale;