import { check, mergeBase, categoricalColor } from 'vizart-core';
import has from 'lodash-es/has';

import AbstractCartesianChart from './AbstractCartesianChart';
import { processStackedData } from '../data';

class AbstractStackedCartesianChart extends AbstractCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._getSeries = ()=> this._options.data.s;
        this._s = d=> d[this._getSeries().accessor];
        this._y1 = d=> this._getMetric().scale(d.y);
        this._y0 = d=> this._getMetric().scale(d.y0);
        this._c = d => {
            return (has(d, 'key'))
                ? this._color(d.key)
                : this._color(this._s(d));
        }
    }

    render(_data) {
        super.render(_data);
    }

    update() {
        super.update();
        this.data(this._data.original);
    }

    data(_data) {
        if (check(_data) === true) {
            this._data = processStackedData(_data, this._options, true);
        }

        return this._data;
    };

    _provideColor() {
        let _num = this._data && this._data.nested
            ? this._data.nested.length
            : 0;

        return categoricalColor(this._options.color.scheme, _num);
    }

}

export default AbstractStackedCartesianChart