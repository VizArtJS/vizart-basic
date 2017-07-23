import cloneDeep from 'lodash-es/cloneDeep';

import sortData from '../processor/sort';
import cleanse from '../processor/cleanse';
import dimensionScale from './dimension';
import metricScale from './metric';
import metricStackedScale from './metric-stacked';
import seriesScale from './series';
import nest from './stacked-layout';


const buildStack = function(_data, _options) {
    dimensionScale(_data, _options);
    metricScale(_data, _options);
    seriesScale(_data, _options);

    let _nestedData = nest(_data, _options);

    let minY;
    let maxY;

    if(_options.plots.stackLayout === true) {
        let _range = metricStackedScale(_nestedData, _options);
        minY = _range[0];
        maxY = _range[1];
    } else {
        minY = _options.data.y[0].min;
        maxY = _options.data.y[0].max;

        if (_options.data.y.length > 1) {
            for (let metric of _options.data.y) {
                minY = Math.min(minY, metric.min);
                maxY = Math.max(maxY, metric.max);
            }
        }
    }
    
    return {
        maxY: maxY,
        minY: minY,
        tabularData: _data,
        nestedData: _nestedData
    };
}

let refresh = function(_data, _options) {
    let _tabularData = _data.tabularData;
    sortData(_tabularData, _options);

    return buildStack(_tabularData, _options);
};


let prepare = function(_data, _options) {
    let original = cloneDeep(_data);

    cleanse(_data, _options);
    sortData(_data, _options);

    let stacked =  buildStack(_data, _options);
    stacked.tabularData = original;

    return stacked;
}

export {
    prepare,
    refresh
}