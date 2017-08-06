import AbstractStackedCartesianChart from './AbstractStackedCartesianChart';
import Axis from './Axis';

class AbstractStackedCartesianChartWithAxes extends AbstractStackedCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this.axes;
    }

    render(_data) {
        super.render(_data);

        this.axes = new Axis(this._options);
        this.axes.render(this._svg, this._data.nested[0].values);
    }

    update() {
        super.update();

        this.axes = new Axis(this._options);
        this.axes.update(this._svg, this._data.nested[0].values);
    }
}

export default AbstractStackedCartesianChartWithAxes;