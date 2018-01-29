import AbstractStackedCartesianChart from './AbstractStackedCartesianChart';
import { renderAxis, updateAxis } from './axis';

class AbstractStackedCartesianChartWithAxes extends AbstractStackedCartesianChart {
  constructor(canvasId, _userOptions) {
    super(canvasId, _userOptions);
  }

  render(_data) {
    super.render(_data);
    renderAxis(
      this._svg,
      this._data.nested[0].values.map(d => d.data),
      this._options
    );
  }

  update() {
    super.update();
    updateAxis(
      this._svg,
      this._data.nested[0].values.map(d => d.data),
      this._options
    );
  }
}

export default AbstractStackedCartesianChartWithAxes;
