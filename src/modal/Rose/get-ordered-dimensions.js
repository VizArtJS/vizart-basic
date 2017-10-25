import isFunction from 'lodash-es/isFunction';
import isArray from 'lodash-es/isArray';
import difference from 'lodash-es/difference';

const getOrderedDimensions = (opt, dimensions)=> {
    const orderDef = opt.plots.dimensionOrder;
    if (orderDef !== null) {
        if (isFunction(orderDef)) {
            return dimensions.order(orderDef);
        } else if (isArray(orderDef)) {
            const diff = difference(dimensions, orderDef);
            if (diff.length > 0) {
                console.warn('rose options.plots.dimensionOrder contains inconsistent values: ' + diff);
            }

            return orderDef;
        }
    }

    return dimensions;
}

export default getOrderedDimensions;