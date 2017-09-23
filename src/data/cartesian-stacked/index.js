import { scaleLinear } from 'd3-scale';

import nest from './stacked-layout';
import getStackedMetricScale from './metric-stacked';
import processCartesianData from '../cartesian/index';

const buildStack = (data, opt)=> {
    let _nestedData = nest(data, opt);

    let minY;
    let maxY;

    if(opt.plots.stackLayout === true) {
        let _range = getStackedMetricScale(_nestedData, opt);
        minY = _range[0];
        maxY = _range[1];

        for (let _metric of opt.data.y) {
            _metric.scale = scaleLinear()
                .domain([minY, maxY])
                .range([opt.chart.innerHeight, 0]);
        }

    } else {
        minY = opt.data.y[0].min;
        maxY = opt.data.y[0].max;

        if (opt.data.y.length > 1) {
            for (let metric of opt.data.y) {
                minY = Math.min(minY, metric.min);
                maxY = Math.max(maxY, metric.max);
            }
        }
    }
    
    return {
        maxY: maxY,
        minY: minY,
        original: data,
        nested: _nestedData
    };
}



const processStackedData = (_data, _options, _cleanse = true)=> {
    let _copy = processCartesianData(_data, _options, _cleanse);

    return buildStack(_copy, _options);
}

export default processStackedData;