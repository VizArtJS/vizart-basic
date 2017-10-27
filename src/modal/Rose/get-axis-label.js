import isFunction from 'lodash-es/isFunction';

const getAxisLabel = (opt, d, i)=> {
    return opt.plots.axisLabel && isFunction(opt.plots.axisLabel)
        ? opt.plots.axisLabel(d, i)
        : d;
}

export default getAxisLabel;
