import { max, min } from 'd3-array';

import tickRange from '../update-scale/ticks';
import Stacks from '../constant/stack-methods';

const rescaleStackedMetric = (nestedData, opt)=> {
    const _min = min(nestedData.map(d=> min(d.values.map(e=>e.y0))));
    const _max = max(nestedData.map(d=> max(d.values.map(e=>e.y1))));

    return opt.plots.stackMethod === Stacks.Expand
        ? [0, 1, 5]
        : tickRange([_min, _max],
            opt.yAxis[0].ticks,
            opt.yAxis[0].tier);
}

export default rescaleStackedMetric;
