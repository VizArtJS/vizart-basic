import { check, mergeBase, categoricalColor } from 'vizart-core';
import has from 'lodash-es/has';

import AbstractCartesianChart from './AbstractCartesianChart';
import { processStackedData } from '../data';

class AbstractStackedCartesianChart extends AbstractCartesianChart {
  constructor(canvasId, _userOptions) {
    super(canvasId, _userOptions);

    this._getSeries = () => this._options.data.s;
    this._s = d => d[this._getSeries().accessor];
    this._y1 = d => this._getMetric().scale(d.y1);
    this._y0 = d => this._getMetric().scale(d.y0);
    this._c = d => {
      return has(d, 'key') ? this._color(d.key) : this._color(this._s(d));
    };
  }

  render(_data) {
    super.render(_data);
  }

  update() {
    this.data(this._data.original);

    super.update();
  }
}

export default AbstractStackedCartesianChart;
