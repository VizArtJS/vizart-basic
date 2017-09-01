import { max, min } from 'd3-array';

import tickRange from './update-scale/ticks';
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

const getStackedMetricScale = (_nestedData, _options)=> {
    let _tickedRange;
    let minY = 0;
    let maxY = mapNested(_nestedData, max);

    if (_options.plots.stackMethod === Stacks.Expand ) {
        if (maxY === 1) {
            _tickedRange = [0, 1, 5];
        } else {
            _tickedRange = tickRange([0, maxY], _options.yAxis[0].ticks, _options.yAxis[0].tier);
        }
    } else {
        minY = mapNested(_nestedData, min);
        _tickedRange = tickRange([minY, maxY], _options.yAxis[0].ticks,_options.yAxis[0].tier);
    }

    return _tickedRange;
}

export default getStackedMetricScale;
