import {
    AbstractChart,
    mergeBase,
    Globals,
    uuid
} from 'vizart-core';
import TooltipTpl from './tooltip-tpl';
import './tooltip.css';
import { select, mouse } from 'd3-selection';

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
    _getTooltipHTML(d) {
        return TooltipTpl
            .replace("{{header}}", this._getDimensionVal(d))
            .replace("{{name}}", this._getMetric().name)
            .replace("{{value}}", this._getMetricVal(d))
            .replace("{{borderStroke}}", this._c(d));
    }

    //todo not a nice way to use 'this', need to improve
    _bindTooltip(_selector, polar = false) {
        let that = this;

        function _mouseMove(d) {
            that._tooltip
                .transition()
                .duration(that._options.tooltip.duration)
                .style("opacity", 1);

            let coordinates = mouse(this);
            let x = coordinates[0];
            let y = coordinates[1];

            if (polar === true) {
                that._tooltip.style("left", (x + (that._options.chart.width / 2)) + "px")
                    .style("top", (y + (that._options.chart.height / 2) +  90) + "px")
                    .html(that._getTooltipHTML(d));
            } else {
                that._tooltip.style("left", x < 40 ? x : (x - 22) + "px")
                    .style("top", y < 40 ? y + 34 : (y - 34) + "px")
                    .html( that._getTooltipHTML(d));
            }
        };

        function _mouseOut() {
            that._tooltip.transition()
                .duration(that._options.tooltip.duration)
                .style("opacity", 0)
        }

        _selector
            .on("mousemove", _mouseMove)
            .on("mouseout", _mouseOut);
    }

}

export default AbstractCartesianChart;