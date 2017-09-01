import groupBy from 'lodash-es/groupBy';
import has from 'lodash-es/has';

import {
    stack,
    stackOffsetExpand,
    stackOffsetNone,
    stackOffsetSilhouette,
    stackOffsetWiggle,
    stackOrderAscending,
    stackOrderNone,
    stackOrderReverse,
    stackOrderDescending,
    stackOrderInsideOut
} from 'd3-shape';

import Stacks from '../constant/stack-methods';

const getSeriesOrdering = (_options)=> {
    return (has(_options, 'ordering')
        && (_options.ordering.accessor === _options.data.s.accessor)
        && (_options.ordering.direction === 'desc'))
            ? stackOrderDescending
            : stackOrderAscending;
}


const generateLayout = (_data, _options)=> {
    const _getDimension = ()=> { return _options.data.x; };
    const _getDimensionVal = d=> d[_getDimension().accessor];
    const _getMetric = ()=> _options.data.y[0];
    const _getMetricValue = d=> d[_getMetric().accessor];

    let _matrix = [];

    let dimensionGroup = groupBy(_data, d=> _getDimensionVal(d));

    for (let _dim of _getDimension().values) {
        let _t = {};

        _t[_getDimension().accessor] = _dim;

        for (let _s of _options.data.s.values) {
            _t[_s] = 0;
        }

        for (let _v of dimensionGroup[_dim]) {
            _t[_v[_options.data.s.accessor]] = _getMetricValue(_v);
        }

        _matrix.push(_t);
    }


    // nested data
    let _stack = stack();

    let _ordering = getSeriesOrdering(_options);

    switch(_options.plots.stackMethod) {
        case Stacks.Expand:
            _stack.offset(stackOffsetExpand).order(_ordering);
            break;
        case Stacks.Zero:
            _stack.offset(stackOffsetNone).order(_ordering);
            break;
        case Stacks.Silhouette:
            _stack.offset(stackOffsetSilhouette).order(stackOrderInsideOut);
            break;
        case Stacks.Wiggle:
            _stack.offset(stackOffsetWiggle).order(stackOrderInsideOut);
            break;

        default:
            _stack.offset(stackOffsetNone);
            break;
    }

    _stack
        .keys(_options.data.s.values);

    return _stack(_matrix);
};

const mergeLayout = (_data, _layout, _options)=> {
    let _nestedData = [];

    for (let _nest of _layout) {
        let _values = [];

        for (let _n of _nest) {
            let _o = {
                y0: _n[0],
                y: _n[1]
            };
            _o[_options.data.s.accessor] = _nest.key;
            _o[_options.data.x.accessor] = _n.data[_options.data.x.accessor];
            _o[_options.data.y[0].accessor] = _n.data[_nest.key];

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