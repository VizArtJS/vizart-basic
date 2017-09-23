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

    console.log(data);
    const stack = getStack(opt);
    stack.keys(series);

    return stack(matrix);
};

const mergeLayout = (_data, _layout, _options)=> {
    let _nestedData = [];

    for (let _nest of _layout) {
        let _values = [];

        for (let _n of _nest) {
            let _o = {
                y0: _n[0],
                y: _n[1],
                data: {}
            };
            _o.data[_options.data.s.accessor] = _nest.key;
            _o.data[_options.data.x.accessor] = _n.data[_options.data.x.accessor];
            _o.data[_options.data.y[0].accessor] = _n.data[_nest.key];

            _values.push(_o);
        }


        _nestedData.push({
            key: _nest.key,
            values: _values
        });
    }

    return _nestedData;
}


const nest = (data, opt)=> {
    let layout = generateLayout(data, opt);
    console.log(layout);
    return mergeLayout(data, layout, opt);
}

export default nest;