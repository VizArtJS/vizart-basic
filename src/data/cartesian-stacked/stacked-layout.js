import { check } from 'vizart-core';
import getStack from './stack';
import transformSeriesToMatrix from './series-to-matrix';
import isSeriesDefined from '../helper/is-series-defined';
import find from 'lodash-es/find';

const generateLayout = (data, opt)=> {
    const matrix = isSeriesDefined(opt)
        ? transformSeriesToMatrix(data, opt)
        : data;

    const series = isSeriesDefined(opt)
        ? opt.data.s.values
        : opt.data.y.map(d=>d.accessor);

    const stack = getStack(opt);
    stack.keys(series);

    return stack(matrix);
};

const mergeLayout = (data, layout, opt)=> {
    return layout.map(d=>{
        const metric = find(opt.data.y, e=>e.accessor = d.key);

        return {
            key: d.key,
            values: d.map(e=> {
                return {
                    y0: e[0],
                    y1: e[1],
                    y: metric.scale(e.data[metric.accessor]),
                    data: e.data
                }
            })
        }
    });
}


const nest = (data, opt)=> {
    const layout = generateLayout(data, opt);
    return mergeLayout(data, layout, opt);
}

export default nest;