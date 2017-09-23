import groupBy from 'lodash-es/groupBy';
import { check } from 'vizart-core';
import getStack from './stack';

const isSeriesDefined = opt=> check(opt.data.s) && check(opt.datat.s.accessor);

const generateLayout = (data, opt)=> {
    const _getDimension = ()=> { return opt.data.x; };
    const _getDimensionVal = d=> d[_getDimension().accessor];
    const _getMetric = ()=> opt.data.y[0];
    const _getMetricValue = d=> d[_getMetric().accessor];

    let _matrix = [];

    if (isSeriesDefined(opt)) {
        let dimensionGroup = groupBy(data, d=> _getDimensionVal(d));


        for (let _dim of _getDimension().values) {
            let _t = {};

            _t[_getDimension().accessor] = _dim;

            for (let _s of opt.data.s.values) {
                _t[_s] = 0;
            }

            for (let _v of dimensionGroup[_dim]) {
                _t[_v[opt.data.s.accessor]] = _getMetricValue(_v);
            }

            _matrix.push(_t);
        }
    } else {
        _matrix= data;
    }

    const stack = getStack(opt);
    stack.keys(opt.data.s.values);

    return stack(_matrix);
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


const nest = (_data, _options)=> {
    let layout = generateLayout(_data, _options);
    return mergeLayout(_data, layout, _options);
}

export default nest;