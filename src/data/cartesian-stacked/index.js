import { scaleLinear } from 'd3-scale';

import generateStackLayout from './stacked-layout';
import rescaleStackedMetric from './scale-stacked-metric';
import processCartesianData from '../cartesian/index';

const processStackedData = (data, opt, cleanse = true)=> {
    let copy = processCartesianData(data, opt, cleanse);
    let nestedData = generateStackLayout(copy, opt);

    let minY = 0;
    let maxY = 0;

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
        for (let m of opt.data.y) {
            minY = Math.min(minY, m.min);
            maxY = Math.max(maxY, m.max);
        }
    }

    return {
        maxY: maxY,
        minY: minY,
        original: data,
        nested: nestedData
    };
}

export default processStackedData;