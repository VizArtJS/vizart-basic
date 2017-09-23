import { scaleLinear } from 'd3-scale';

import nest from './stacked-layout';
import getStackedMetricScale from './metric-stacked';
import processCartesianData from '../cartesian/index';

const processStackedData = (_data, opt, cleanse = true)=> {
    let copy = processCartesianData(_data, opt, cleanse);
    let nestedData = nest(copy, opt);

    let minY;
    let maxY;

    if(opt.plots.stackLayout === true) {
        let _range = getStackedMetricScale(nestedData, opt);
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
        nested: nestedData
    };
}

export default processStackedData;