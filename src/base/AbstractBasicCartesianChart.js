import {
    makeColorScale,
    check
} from 'vizart-core';

import AbstractCartesianChart from './AbstractCartesianChart';
import {
    prepareCartesian,
    refreshCartesian,
} from '../data';

class AbstractBasicCartesianChart extends AbstractCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    update() {
        super.update();
        refreshCartesian(this._data, this._options);
    }

    data(_data) {
        if (check(_data) === true) {
            prepareCartesian(_data, this._options);
            this._data = _data;
        }

        return this._data;
    };

    _provideColorScale() {
        let _array = this._data.map(this._getMetricVal);
        return makeColorScale(this._options.color, _array);
    }
}

export default AbstractBasicCartesianChart;