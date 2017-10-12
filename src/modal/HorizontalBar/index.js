import { mouse, select } from 'd3-selection';
import { transition } from 'd3-transition';
import isUndefined from 'lodash-es/isUndefined';
import isFunction from 'lodash-es/isFunction';

import {
    Globals,
    mergeOptions,
    uuid
} from 'vizart-core';

import AbstractBasicCartesianChart from '../../base/AbstractBasicCartesianChart';
import createCartesianOpt from '../../options/createCartesianOpt';
import sortSelector from '../../data/helper/sort-selector';
import drawCanvas from './draw-canvas';
import drawHiddenRects from './draw-hidden-rects';
import hasNegativeValue from '../../util/has-negative';

const DefaultOpt = {
    chart: { type: 'bar_horizontal'},
    plots: {
        barLabel: {
            enabled: false,
            color: 'black'
        },
        metricLabel: {
            enabled: false,
            color: 'black',
            offset: 10
        },

        miniBarWidth: 100,

    }
};

class HorizontalBar extends AbstractBasicCartesianChart {
    constructor(canvasId, userOpt) {
        super(canvasId, userOpt);

        this._h = ()=> this._getDimension().scale.bandwidth();
        this._zero = ()=> this._getMetric().scale(0);

        // We also make a map/dictionary to keep track of colors associated with node.
        this.colToNode;
        this.miniCanvas;
        this.miniContext;
    }

    render(data) {
        super.render(data);
        const devicePixelRatio = window.devicePixelRatio || 1;

        const width = this._options.plots.miniBarWidth;
        const height = this._options.chart.innerHeight;

        this.miniCanvas = select(this._containerId)
            .append("canvas")
            .attr("id", 'mini'+ uuid())
            .style('display', 'block')
            .style('position', 'absolute')
            .style('left', this._options.chart.width - width - this._options.chart.margin.right + 'px')
            .style('top', 0)
            .style("width", width + "px")
            .style("height", height + "px")
            .style('margin', this._options.chart.margin.top + 'px 0 0 ' + this._options.chart.margin.left + 'px ')
            .attr('width', width * devicePixelRatio)
            .attr('height', height * devicePixelRatio);

        this.miniContext = this.miniCanvas.node().getContext('2d');
        this.miniContext.scale(this._canvasScale, this._canvasScale);
    }

    _animate() {
        this._getDimension().scale.range([0, this._options.chart.innerHeight]);
        this._getMetric().scale.range([0, this._options.chart.innerWidth - this._options.plots.miniBarWidth]);

        this.drawMainBars(this._data);
        this.drawMiniBars(this._data);
    }

    drawMiniBars(data) {
        const drawCanvasInTransition = ()=> {
            return t=> {
                drawCanvas(this.miniContext, this._detachedContainer.selectAll('.mini'), this._options);
            }};

        const miniXScale = this._getDimension().scale.copy();
        const miniYScale = this._getMetric().scale.copy().range([0, this._options.plots.miniBarWidth]);

        const h = miniXScale.bandwidth();
        const y = d=> miniYScale(this._getMetricVal(d));
        const x = this._x;

        const dataUpdate = this._detachedContainer.selectAll('.mini').data(data);
        const dataJoin = dataUpdate.enter();
        const dataRemove = dataUpdate.exit();

        const exitTransition = transition()
            .duration(this._options.animation.duration.remove)
            .each(()=>{
                dataRemove
                    .transition()
                    .attr("width", 0)
                    .tween("remove.mini", drawCanvasInTransition);

                dataRemove.remove();
            });

        const updateTransition = exitTransition.transition()
            .duration(this._options.animation.duration.update)
            .each(()=> {
                dataUpdate
                    .transition("update-rect-transition")
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.update)
                    .attr('fill', 'grey')
                    .attr('width', y)
                    .attr("y", x)
                    .attr("height", h)
                    .tween("update.mini", drawCanvasInTransition);
            });

        const enterTransition = updateTransition.transition()
            .duration(this._options.animation.duration.add)
            .each(()=>{
                dataJoin.append("rect")
                    .attr('class', 'mini')
                    .attr('fill', 'grey')
                    .attr('opacity', 1)
                    .attr("x", 0)
                    .attr("y", x)
                    .attr('width', 0)
                    .attr("height", h)
                    .transition()
                    .duration(this._options.animation.duration.add)
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.add)
                    .attr('width', y)
                    .tween("append.mini", drawCanvasInTransition);
            });

        const that = this;
        enterTransition.on('end', ()=> {
        });
    }

    drawMainBars(data) {
        const drawCanvasInTransition = ()=> {
            return t=> {
                drawCanvas(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options);
            }};

        const dataUpdate = this._detachedContainer.selectAll('.bar').data(data);
        const dataJoin = dataUpdate.enter();
        const dataRemove = dataUpdate.exit();

        const exitTransition = transition()
            .duration(this._options.animation.duration.remove)
            .each(()=>{
                dataRemove
                    .transition()
                    .attr("width", 0)
                    .tween("remove.rects", drawCanvasInTransition);

                dataRemove.remove();
            });

        const updateTransition = exitTransition.transition()
            .duration(this._options.animation.duration.update)
            .each(()=> {
                dataUpdate
                    .attr('dimension', this._getDimensionVal)
                    .attr('metric', this._getMetricVal)
                    .transition("update-rect-transition")
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.update)
                    .attr('fill', this._c)
                    .attr('width', this._y)
                    .attr("y", this._x)
                    .attr("height", this._h)
                    .tween("update.rects", drawCanvasInTransition);
            });

        const enterTransition = updateTransition.transition()
            .duration(this._options.animation.duration.add)
            .each(()=>{
                dataJoin.append("rect")
                    .attr('class', 'bar')
                    .attr('fill', this._c)
                    .attr('opacity', 1)
                    .attr("x", 0)
                    .attr("y", this._x)
                    .attr('width', 0)
                    .attr('dimension', this._getDimensionVal)
                    .attr('metric', this._getMetricVal)
                    .attr("height", this._h)
                    .transition()
                    .duration(this._options.animation.duration.add)
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.add)
                    .attr('width', this._y)
                    .tween("append.rects", drawCanvasInTransition);
            });

        const that = this;
        enterTransition.on('end', ()=> {
            const colorMap = drawHiddenRects(this._hiddenContext, this._detachedContainer.selectAll('.bar'));

            // shadow color?
            /**
             * callback for when the mouse moves across the overlay
             */
            function mouseMoveHandler() {
                // get the current mouse position
                const [mx, my] = mouse(this);
                // This will return that pixel's color
                const col = that._hiddenContext.getImageData(mx * that._canvasScale, my * that._canvasScale, 1, 1).data;
                //Our map uses these rgb strings as keys to nodes.
                const colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
                const node = colorMap.get(colString);

                if (node) {
                    that._tooltip
                        .html(that.tooltip(node))
                        .transition()
                        .duration(that._options.animation.tooltip)
                        .style("left", mx + that._options.tooltip.offset[0] + "px")
                        .style("top", my + that._options.tooltip.offset[1] + "px")
                        .style("opacity", 1);
                } else {
                    that._tooltip
                        .transition()
                        .duration(that._options.animation.tooltip)
                        .style("opacity", 0);
                }
            }

            function mouseOutHandler() {
                that._tooltip
                    .transition()
                    .duration(that._options.animation.tooltip)
                    .style("opacity", 0);
            }

            that._frontCanvas.on('mousemove', mouseMoveHandler);
            that._frontCanvas.on('mouseout', mouseOutHandler);
            that._listeners.call('rendered');
        });
    }

    sortDetached() {
        this._detachedContainer
            .selectAll(".bar")
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i) => i / this._data.length * this._options.animation.duration.update)
            .attr("x", this._x);
    }

    sort(field, direction) {
        this._options.ordering = {
            accessor: field,
            direction: direction
        };

        this._data = super.data(this._data);
        sortSelector(this._detachedContainer.selectAll('.bar'), this._options);

        const drawCanvasInTransition = ()=> {
            return t=> {
                drawCanvas(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options);
            }};

        this._detachedContainer.selectAll(".bar")
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> i / this._data.length * this._options.animation.duration.update)
            .attr("x", this._x)
            .tween("append.rects", drawCanvasInTransition);

        this.axes.update(this._svg, this._data);
    }

    createOptions(_userOptions) {
        return createCartesianOpt(DefaultOpt, _userOptions);
    }
}

export default HorizontalBar;