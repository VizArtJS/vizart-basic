import { check } from 'vizart-core';
import getStack from './stack';
import transformSeriesToMatrix from './series-to-matrix';
import isSeriesDefined from '../helper/is-series-defined';

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
        return {
            key: d.key,
            values: d.map(e=> {
                return {
                    y0: e[0],
                    y: e[1],
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