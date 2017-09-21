import { scaleLinear } from 'd3-scale';

import nest from './stacked-layout';
import getStackedMetricScale from './metric-stacked';
import processCartesianData from './cartesian';

const buildStack = (_data, _options)=> {
    let _nestedData = nest(_data, _options);

    let minY;
    let maxY;

    if(_options.plots.stackLayout === true) {
        let _range = getStackedMetricScale(_nestedData, _options);
        minY = _range[0];
        maxY = _range[1];

        for (let _metric of _options.data.y) {
            _metric.scale = scaleLinear()
                .domain([minY, maxY])
                .range([_options.chart.innerHeight, 0]);
        }

    } else {
        minY = _options.data.y[0].min;
        maxY = _options.data.y[0].max;

        if (_options.data.y.length > 1) {
            for (let metric of _options.data.y) {
                minY = Math.min(minY, metric.min);
                maxY = Math.max(maxY, metric.max);
            }
        }
    }
    
    return {
        maxY: maxY,
        minY: minY,
        original: _data,
        nested: _nestedData
    };
}



const processStackedData = (_data, _options, _cleanse = true)=> {
    let _copy = processCartesianData(_data, _options, _cleanse);

    return buildStack(_copy, _options);
}

export default processStackedData;