import groupBy from 'lodash-es/groupBy';

const transformSeriesToMatrix = (data, opt)=> {
    const matrix = [];

    const _getDimension = ()=> { return opt.data.x; };
    const _getDimensionVal = d=> d[_getDimension().accessor];
    const _getMetric = ()=> opt.data.y[0];
    const _getMetricValue = d=> d[_getMetric().accessor];

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

        matrix.push(_t);
    }

    return matrix;
}

export default transformSeriesToMatrix;