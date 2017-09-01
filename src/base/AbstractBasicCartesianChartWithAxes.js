import AbstractBasicCartesianChart from './AbstractBasicCartesianChart';
import Axis from './Axis';

class AbstractBasicCartesianChartWithAxes extends AbstractBasicCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
        this.axes;
    }

    render(_data) {
        super.render(_data);

        this.axes = new Axis(this._options);
        this.axes.render(this._svg, this._data);
    }

    update() {
        super.update();
        this.axes = new Axis(this._options);
        this.axes.update(this._svg, this._data, this._isBar());
    }

    _isBar() {
        return false;
    }

}

export default AbstractBasicCartesianChartWithAxes;