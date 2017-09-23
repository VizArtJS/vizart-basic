import { scaleLinear } from 'd3-scale';

import generateStackLayout from './stacked-layout';
import rescaleStackedMetric from './scale-stacked-metric';
import processCartesianData from '../cartesian/index';

const processStackedData = (_data, opt, cleanse = true)=> {
    let copy = processCartesianData(_data, opt, cleanse);
    let nestedData = generateStackLayout(copy, opt);

    let minY;
    let maxY;

    if(opt.plots.stackLayout === true) {
        let _range = rescaleStackedMetric(nestedData, opt);
        minY = _range[0];
        maxY = _range[1];

        for (let m of opt.data.y) {
            m.scale = scaleLinear()
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