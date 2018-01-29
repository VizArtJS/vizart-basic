import { genericColor, check } from 'vizart-core';

import AbstractCartesianChart from './AbstractCartesianChart';
import { processCartesianData } from '../data';

class AbstractBasicCartesianChart extends AbstractCartesianChart {
  constructor(canvasId, _userOptions) {
    super(canvasId, _userOptions);
  }

  update() {
    super.update();
    this._data = processCartesianData(this._data, this._options, false);
  }

  data(_data) {
    if (check(_data) === true) {
      this._data = processCartesianData(_data, this._options, true);
    }

    return this._data;
  }

  _provideColor() {
    let _array = this._data.map(this._getMetricVal);
    return genericColor(this._options.color, _array);
  }
}

export default AbstractBasicCartesianChart;
