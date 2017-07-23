import sortData from '../processor/sort';
import cleanse from '../processor/cleanse';
import dimensionScale from './dimension';
import metricScale from './metric';
import zScale from './z';

let prepare = function(_data, _options) {
    cleanse(_data, _options);

    refresh(_data, _options);
};

let refresh = function(_data, _options) {
    sortData(_data, _options);
    dimensionScale(_data, _options);
    metricScale(_data, _options);
    zScale(_data, _options);
}

export {
    prepare,
    refresh
}