import { mouse, select, event } from 'd3-selection';
import { transition } from 'd3-transition';
import { scaleBand, scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { symbolTriangle, symbol } from 'd3-shape';
import isUndefined from 'lodash-es/isUndefined';
import isFunction from 'lodash-es/isFunction';

import { brushY, brushSelection } from 'd3-brush';

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
import tickRange from '../../data/update-scale/ticks';

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

        miniBarWidth: 50,

    }
};

const miniWidth = opt=> opt.chart.width
    - opt.plots.miniBarWidth
    - opt.chart.margin.right;

const InitialBrushHeight = 200;

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

        const miniX = miniWidth(this._options);

        // this.miniCanvas = select(this._containerId)
        //     .append("canvas")
        //     .attr("id", 'mini'+ uuid())
        //     .style('display', 'block')
        //     .style('position', 'absolute')
        //     .style('left', miniX + 'px')
        //     .style('top', 0)
        //     .style("width", width + "px")
        //     .style("height", height + "px")
        //     .style('margin', this._options.chart.margin.top + 'px 0 0 ' + this._options.chart.margin.left + 'px ')
        //     .attr('width', width * devicePixelRatio)
        //     .attr('height', height * devicePixelRatio);
        //
        // this.miniContext = this.miniCanvas.node().getContext('2d');
        // this.miniContext.scale(this._canvasScale, this._canvasScale);
    }

    _animate() {
        this._getDimension().scale.range([0, this._options.chart.innerHeight]);
        this._getMetric().scale.range([0, this._options.chart.innerWidth - this._options.plots.miniBarWidth]);

        this.drawMiniSvg(this._data);
        const filteredData = this._data.filter(d=> this._x(d) < InitialBrushHeight);
        this.drawMainBars(filteredData);
        this.drawAxis(filteredData)
    }

    drawAxis(data) {

    }

    drawMiniSvg(data) {
        const width = this._options.plots.miniBarWidth;
        const height = this._options.chart.innerHeight;

        const miniX = miniWidth(this._options);

        this.miniSvg = this._container.append('g')
            .attr('width', width)
            .attr('height', height)
            .attr("transform", "translate(" + miniX + "," + this._options.chart.margin.top + ")");

        const miniXScale = this._getDimension().scale.copy();
        const miniYScale = this._getMetric().scale.copy().range([0, this._options.plots.miniBarWidth]);

        const h = miniXScale.bandwidth();
        const y = d=> miniYScale(this._getMetricVal(d));
        const x = this._x;

        const dataUpdate = this.miniSvg.selectAll('.mini').data(data);
        const dataJoin = dataUpdate.enter();
        const dataRemove = dataUpdate.exit();

        dataRemove.remove();
        dataUpdate
            .attr('width', y)
            .attr("y", x)
            .attr("height", h);
        dataJoin.append("rect")
            .attr('class', 'mini')
            .attr('fill', '#e0e0e0')
            .attr('opacity', 1)
            .attr("x", 0)
            .attr("y", x)
            .attr("height", h)
            .attr('width', y);

        const mini_width = this._options.plots.miniBarWidth;
        const brush = brushY()
            .extent([[0, 0], [miniX, this._options.chart.innerHeight]]);

        const brushMove = ()=> {
            const s = event.selection;
            this.miniSvg.selectAll('.mini')
                .attr('fill', d=> {
                    return s[0] <= (d = x(d)) && d <= s[1]
                        ? '#1bcebf'
                        : '#e0e0e0';
                })
                .classed('selected', d=> s[0] <= (d = x(d)) && d <= s[1]);

            const data = this.miniSvg.selectAll('.selected').data();
            this.drawMainBars(data);

        }

        brush.on("brush", brushMove);

        this.miniSvg.call(brush);
        this.miniSvg.call(brush.move, [0, InitialBrushHeight]);
    }


    drawMainBars(data) {
        const drawCanvasInTransition = ()=> {
            return t=> {
                drawCanvas(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options);
            }};

        const xScale = scaleBand()
            .domain(data.map(d=> this._getDimensionVal(d)))
            .range([0, this._options.chart.innerHeight])
            .paddingInner(.1)
            .paddingOuter(.6);

        const yExtent = extent(data, this._getMetricVal);
        const tickedRange = tickRange(yExtent, this._options.yAxis[0].ticks, this._options.yAxis[0].tier);
        const yScale = scaleLinear()
            .domain([tickedRange[0], tickedRange[1]])
            .range([0, this._options.chart.innerWidth - this._options.plots.miniBarWidth]);

        const h = xScale.bandwidth();
        const x = d=> xScale(this._getDimensionVal(d));
        const y = d=> yScale(this._getMetricVal(d));

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
                    .attr('width', y)
                    .attr("y", x)
                    .attr("height", h)
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
                    .attr("y", x)
                    .attr('width', 0)
                    .attr('dimension', this._getDimensionVal)
                    .attr('metric', this._getMetricVal)
                    .attr("height", h)
                    .transition()
                    .duration(this._options.animation.duration.add)
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.add)
                    .attr('width', y)
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