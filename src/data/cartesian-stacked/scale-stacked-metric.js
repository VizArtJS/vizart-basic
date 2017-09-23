import { max, min } from 'd3-array';

import tickRange from '../update-scale/ticks';
import Stacks from '../constant/stack-methods';

const mapY = d => d.values.map(e=> e.y);

/**
 * get max/min of the nestedData
 *
 * @param nested nested data
 * @param operation min/max
 * @returns {*} max/min of the nestedData
 */
const mapNested = (nested, operation)=> {
    return operation(nested.map(d=> operation(mapY(d))));
}

const rescaleStackedMetric = (nestedData, opt)=> {
    return opt.plots.stackMethod === Stacks.Expand
        ? [0, 1, 5]
        : tickRange([mapNested(nestedData, min), mapNested(nestedData, max)],
            opt.yAxis[0].ticks,
            opt.yAxis[0].tier);
}

export default rescaleStackedMetric;
