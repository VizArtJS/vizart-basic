import {
    mouse,
    event
} from 'd3-selection';
import { transition } from 'd3-transition';
import {
    scaleBand,
    scaleLinear
} from 'd3-scale';
import { extent } from 'd3-array';
import { axisBottom } from 'd3-axis';

import { brushY } from 'd3-brush';

import {
    Globals,
    mergeOptions,
    uuid
} from 'vizart-core';

import hasNegativeValue from '../../util/has-negative';

import AbstractBasicCartesianChart from '../../base/AbstractBasicCartesianChart';
import createCartesianOpt from '../../options/createCartesianOpt';
import drawCanvas from './draw-canvas';
import drawHiddenRects from './draw-hidden-rects';
import tickRange from '../../data/update-scale/ticks';
import brushResizePath from '../../util/brush-handle';

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

        miniBarWidth: 30,

    }
};

const miniWidth = opt=> opt.chart.width
    - opt.plots.miniBarWidth
    - opt.chart.margin.right;

const InitialBrushHeight = 200;

class HorizontalBar extends AbstractBasicCartesianChart {
    constructor(canvasId, userOpt) {
        super(canvasId, userOpt);

        this.colToNode;
        this.miniCanvas;
        this.miniContext;

        this.fullData;
    }

    render(data) {
        super.render(data);
        const devicePixelRatio = window.devicePixelRatio || 1;

        const width = this._options.plots.miniBarWidth;
        const height = this._options.chart.innerHeight;
        const miniX = miniWidth(this._options);

        this.miniCanvas = select(this._containerId)
            .append("canvas")
            .attr("id", 'mini'+ uuid())
            .style('display', 'block')
            .style('position', 'absolute')
            .style('left', miniX + 'px')
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

        this.drawMiniSvg(this._data);
        this.drawMainBars(this._data.filter(d=> this._x(d) < InitialBrushHeight));
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

        this.brushGroup = this.miniSvg.append('g')
            .attr('class', 'brush');

        const brush = brushY()
            .extent([[0, 0], [miniX, this._options.chart.innerHeight]]);

        const handle = this.brushGroup.selectAll(".custom-handle")
            .data([{type: "w"}, {type: "e"}])
            .enter()
            .append("path")
            .attr("class", "custom-handle")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("cursor", "ns-resize")
            .attr("d", brushResizePath(this._options.plots.miniBarWidth))
            .attr('transform', 'rotate(90) translate(0,-65)');

        const brushMove = ()=> {
            const s = event.selection;

            if (s === null) {
                handle.attr("display", "none");
            } else {
                handle.attr("display", null)
                    .attr("transform", (d, i)=>  "rotate(90) translate(" + [ s[i], -65] + ")");
            }

            this.miniSvg.selectAll('.mini')
                .attr('fill', d=> {
                    return s[0] <= (d = x(d)) && d <= s[1]
                        ? '#1bcebf'
                        : '#e0e0e0';
                })
                .classed('selected', d=> s[0] <= (d = x(d)) && d <= s[1]);

            const data = this.miniSvg.selectAll('.selected').data();
            this.drawMainBars(data);
            this.updateAxis(data);

        }

        brush.on("start brush end", brushMove);

        this.brushGroup.call(brush);
        this.brushGroup.call(brush.move, [0, InitialBrushHeight]);
    }

    updateAxis(data) {
        const yExtent = extent(data, this._getMetricVal);
        const tickedRange = tickRange(yExtent, this._options.yAxis[0].ticks, this._options.yAxis[0].tier);
        const yScale = scaleLinear()
            .domain([tickedRange[0], tickedRange[1]])
            .range([0, this._options.chart.innerWidth - this._options.plots.miniBarWidth - this._options.chart.margin.left * 2]);

        const bottomAxis = axisBottom()
            .scale(yScale);

        if (!this.bottomAxis) {
            this.bottomAxis = this._container.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(" + this._options.chart.margin.left +  "," + (this._options.chart.innerHeight + 10) + ")");

        }

        this.bottomAxis.call(bottomAxis);
        this.bottomAxis.select('.domain').style('opacity', 0);

        this._container.select(".x.axis")
            .transition()
            .duration(50)
            .call(bottomAxis);
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
        const colorScale = this._color.copy()
            .domain([tickedRange[0], tickedRange[1]]);
        const c = d=> colorScale(this._getMetricVal(d));

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
                    .attr('fill', c)
                    .attr('width', y)
                    .attr("y", x)
                    .attr("height", h)
                    .tween("update.rects", drawCanvasInTransition);
            });

        const enterTransition = updateTransition.transition()
            .duration(this._options.animation.duration.update)
            .each(()=>{
                dataJoin.append("rect")
                    .attr('class', 'bar')
                    .attr('fill', c)
                    .attr('opacity', 1)
                    .attr("x", 0)
                    .attr("y", x)
                    .attr('width', 0)
                    .attr('dimension', this._getDimensionVal)
                    .attr('metric', this._getMetricVal)
                    .attr("height", h)
                    .transition()
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.update)
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

    createOptions(_userOptions) {
        return createCartesianOpt(DefaultOpt, _userOptions);
    }
}

export default HorizontalBar;