import {
    AbstractChart,
    mergeBase,
    Globals,
    uuid
} from 'vizart-core';
import './tooltip.css';
import { select } from 'd3-selection';

class AbstractCartesianChart extends AbstractChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._getMetric = ()=> this._options.data.y[0];
        this._getDimension = ()=> this._options.data.x;
        this._getDimensionVal = d=> d[this._getDimension().accessor];
        this._getMetricVal = d=> d[this._getMetric().accessor];
        this._x = d=> this._getDimension().scale(this._getDimensionVal(d));
        this._y = d=> this._getMetric().scale(this._getMetricVal(d));

        this._c = (d)=> {
            if (d.color) {
                return d.color;
            }

            switch (this._options.color.type){
                case Globals.ColorType.CATEGORICAL:
                    return this._color(this._getDimensionVal(d));
                case Globals.ColorType.GRADIENT:
                case Globals.ColorType.DISTINCT:
                    return this._color(this._getMetricVal(d));
                default:
                    return this._color(this._getMetricVal(d));
            }
        };
    }

    render(_data) {
        super.render(_data);

        this._tooltip = select(this._containerId)
            .append("div")
            .attr('id', 'tooltip-' + uuid())
            .attr('class', 'vizart-tooltip')
            .style("opacity", 0);
    }

    sort(_accessor, direction) {
        this._options.ordering = {
            accessor: _accessor,
            direction: direction
        };

        this.update();
    };

    _hasNegativeValue() {
        let hasNegative = false;

        dataLoop:
        for (let d of this.data()) {
            for (let _y of this._options.data.y) {
                if (d[_y.accessor] < 0) {
                    hasNegative = true;
                    break dataLoop;
                }
            }
        }

        return hasNegative;
    }
}

export default AbstractCartesianChart;