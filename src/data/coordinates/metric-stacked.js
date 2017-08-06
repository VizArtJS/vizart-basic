import { max, min } from 'd3-array';

import tickRange from './update-scale/ticks';
import Stacks from '../constant/stack-methods';

const getStackedMetricScale = (_nestedData, _options)=> {
    let _tickedRange;
    let minY = 0;
    let maxY = max(_nestedData.map( d=> max(d.values.map(d => d.y))));

    if (_options.plots.stackMethod === Stacks.Expand ) {
        if (maxY === 1) {
            _tickedRange = [0, 1, 5];
        } else {
            _tickedRange = tickRange([0, maxY], _options.yAxis[0].ticks, _options.yAxis[0].tier);
        }
    } else {
        minY = min(_nestedData.map( d=> min(d.values.map(d=> d.y))));
        _tickedRange = tickRange([minY, maxY], _options.yAxis[0].ticks,_options.yAxis[0].tier);
    }

    return _tickedRange;
}

export default getStackedMetricScale;
