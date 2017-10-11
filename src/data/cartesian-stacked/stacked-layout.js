import { check } from 'vizart-core';
import getStack from './stack';
import transformSeriesToMatrix from './series-to-matrix';
import isSeriesDefined from '../helper/is-series-defined';
import find from 'lodash-es/find';
import uniq from 'lodash-es/uniq';
import map from 'lodash-es/map';

const generateStackLayout = (data, opt)=> {
    if (isSeriesDefined(opt)) {
        opt.data.s.values = uniq(map(data, opt.data.s.accessor));
    } else {
        opt.data.s.values = opt.data.y.map(d=>d.accessor);
    }

    const matrix = isSeriesDefined(opt)
        ? transformSeriesToMatrix(data, opt)
        : data;

    const stack = getStack(opt);
    stack.keys(opt.data.s.values);
    const layout = stack(matrix);

    return layout.map(d=>{
        const metric = find(opt.data.y, e=>e.accessor === d.key);

        return {
            label: metric ? metric.name : d.key,
            key: d.key,
            values: d.map(e=> {
                return {
                    y0: e[0],
                    y1: e[1],
                    y: metric
                        ? metric.scale(e.data[metric.accessor])
                        : opt.data.y[0].scale(e.data[d.key]),
                    data: e.data
                }
            })
        }
    });
}

export default generateStackLayout;