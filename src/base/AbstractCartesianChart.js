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

        this._fontCanvasId = 'front-canvas' + uuid();
        this._frontCanvasId = 'color-canvas-' + uuid();
        this._frontCanvas;
        this._hiddenCanvas;
        this._frontContext;
        this._hiddenContext;
        this._detachedContainer;
    }

    render(_data) {
        super.render(_data);


        select(this._containerId).style('position', 'absolute');

        this._detachedContainer = select(this._containerId).append('vizart-detached');

        const devicePixelRatio = window.devicePixelRatio || 1;

        this._hiddenCanvas = select(this._containerId)
            .append("canvas")
            .attr("id", this._frontCanvasId)
            .style('display', 'none')
            .style("width", this._options.chart.innerWidth + "px")
            .style("height", this._options.chart.innerHeight + "px")
            .style('margin', this._options.chart.margin.top + 'px 0 0 ' + this._options.chart.margin.left + 'px ')
            .attr('width', this._options.chart.width * devicePixelRatio)
            .attr('height', this._options.chart.height * devicePixelRatio);

        this._frontCanvas = select(this._containerId)
            .append("canvas")
            .attr("id", this._fontCanvasId)
            .style('display', 'block')
            .style("width", this._options.chart.innerWidth + "px")
            .style("height", this._options.chart.innerHeight + "px")
            .style('margin', this._options.chart.margin.top + 'px 0 0 ' + this._options.chart.margin.left + 'px ')
            .attr('width', this._options.chart.width * devicePixelRatio)
            .attr('height', this._options.chart.height * devicePixelRatio);



        this._hiddenContext = this._hiddenCanvas.node().getContext("2d");
        this._frontContext = this._frontCanvas.node().getContext('2d');


        const backingStoreRatio = this._frontContext.webkitBackingStorePixelRatio
            || this._frontContext.mozBackingStorePixelRatio
            || this._frontContext.msBackingStorePixelRatio
            || this._frontContext.oBackingStorePixelRatio
            || this._frontContext.backingStorePixelRatio
            || 1;

        const ratio = devicePixelRatio / backingStoreRatio;
        this._frontContext.scale(ratio, ratio);
        this._hiddenContext.scale(ratio, ratio);

        this._container
            .style('position', 'absolute')
            .style('top', 0)
            .style('left', 0)
            .style('pointer-events', 'none');

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