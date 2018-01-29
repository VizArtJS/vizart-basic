import AbstractBasicCartesianChart from './AbstractBasicCartesianChart';
import { renderAxis, updateAxis } from './axis';

class AbstractBasicCartesianChartWithAxes extends AbstractBasicCartesianChart {
  constructor(canvasId, _userOptions) {
    super(canvasId, _userOptions);
  }

  render(_data) {
    super.render(_data);
    renderAxis(this._svg, this._data, this._options);
  }

  update() {
    super.update();
    updateAxis(this._svg, this._data, this._options);
  }
}

export default AbstractBasicCartesianChartWithAxes;
