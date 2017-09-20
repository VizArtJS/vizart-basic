import AbstractStackedCartesianChart from './AbstractStackedCartesianChart';
import {
    renderAxis,
    updateAxis
} from './Axis';

class AbstractStackedCartesianChartWithAxes extends AbstractStackedCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    render(_data) {
        super.render(_data);
        renderAxis(this._svg, this._data, this._options);
    }

    update() {
        super.update();
        updateAxis(this._svg, this._data, this._options, this._isBar());
    }
}

export default AbstractStackedCartesianChartWithAxes;