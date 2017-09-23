import { max, min } from 'd3-array';

import tickRange from '../update-scale/ticks';
import Stacks from '../constant/stack-methods';

const mapY = d => d.values.map(e=> e.y);

/**
 * get max/min of the nestedData
 *
 * @param _nested nested data
 * @param _oper min/max
 * @returns {*} max/min of the nestedData
 */
const mapNested = (_nested, _oper)=> {
    return _oper(_nested.map(d=> _oper(mapY(d))));
}

const getStackedMetricScale = (nestedData, opt)=> {
    return opt.plots.stackMethod === Stacks.Expand
        ? [0, 1, 5]
        : tickRange([mapNested(nestedData, min), mapNested(nestedData, max)],
            opt.yAxis[0].ticks,
            opt.yAxis[0].tier);
}

export default getStackedMetricScale;
