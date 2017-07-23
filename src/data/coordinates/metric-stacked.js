import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';

import tickRange from './ticks';
import Stacks from '../constant/stack-methods';

const metricStackedScale = (_nestedData, _options)=> {
    let _tickedRange;
    let minY;
    let maxY = max(_nestedData.map( (d)=> {
        return max(d.values.map((d)=> {
            return d.y;
        }));
    }));

    if (_options.plots.stackMethod === Stacks.Expand ) {
        if (maxY === 1) {
            _tickedRange = [0, 1, 5];
        } else {
            _tickedRange = tickRange([0, maxY], _options.yAxis[0].ticks, _options.yAxis[0].tier);
        }
    } else {
        let minY = min(_nestedData.map( (d)=> {
            return min(d.values.map( (d)=> {
                return d.y;
            }));
        }));
        _tickedRange = tickRange([minY, maxY], _options.yAxis[0].ticks,_options.yAxis[0].tier);
    }

    minY = _tickedRange[0];
    maxY = _tickedRange[1];

    for (let _metric of _options.data.y) {
        _metric.scale = scaleLinear()
            .domain([minY, maxY])
            .range([_options.chart.innerHeight, 0]);
    }

    return _tickedRange;
}

export default metricStackedScale;
