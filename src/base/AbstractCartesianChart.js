import {
    AbstractChart,
    mergeBase,
    GRADIENT,
    DISTINCT,
    CATEGORICAL
} from 'vizart-core';
import TooltipTpl from './tooltip-tpl';
import './tooltip.css';

class AbstractCartesianChart extends AbstractChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._getMetric = ()=> {  return this._options.data.y[0]; };
        this._getDimension = ()=> { return this._options.data.x; };
        this._getDimensionVal = (d)=> { return d[this._getDimension().accessor]; };
        this._getMetricVal = (d)=> { return d[this._getMetric().accessor]; };

        this._x = (d)=> {
            return this._getDimension().scale(this._getDimensionVal(d));
        };

        this._y = (d)=> {
            return this._getMetric().scale(this._getMetricVal(d));
        };

        this._c = (d)=> {
            if (d.color) {
                return d.color;
            }

            switch (this._options.color.type){
                case CATEGORICAL:
                    return this._colorScale(this._getDimensionVal(d));
                case GRADIENT:
                case DISTINCT:
                    return this._colorScale(this._getMetricVal(d));
                default:
                    return this._colorScale(this._getMetricVal(d));
            }
        };
    }

    render(_data) {
        super.render(_data);
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
    _getTooltipHTML(d) {
        return TooltipTpl
            .replace("{{header}}", this._getDimensionVal(d))
            .replace("{{name}}", this._getMetric().name)
            .replace("{{value}}", this._getMetricVal(d))
            .replace("{{borderStroke}}", this._c(d));
    }

}

export default AbstractCartesianChart;