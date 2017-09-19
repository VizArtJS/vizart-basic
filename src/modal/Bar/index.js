import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { mouse, select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeCubic } from 'd3-ease';

import {
    Globals,
    mergeOptions
} from 'vizart-core';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isFunction from 'lodash-es/isFunction';

import AbstractCanvasChart from '../../canvas/AbstractCanvasChart';
import createCartesianOpt from '../../options/createCartesianOpt';
import processCartesianData from '../../data/coordinates/cartesian';
import {getSortDef} from '../../data/helper';

const BarOpt = {
    chart: { type: 'bar_horizontal'},
    plots: {
        barLabel: {
            enabled: true,
            color: 'black'
        },
        metricLabel: {
            enabled: true,
            color: 'black'
        }
    }
};

const withinRect = (d, x, y)=> {
    return this.x <= x && x <= this.x + this.width
        && this.y <= y && y <= this.y + this.height;
}

const drawVerticalLabel = (context, node, opt)=> {
    context.save();

    context.translate(node.attr('x'), opt.chart.innerHeight);
    context.rotate(-Math.PI/2);
    context.textAlign = "bottom";
    context.textBaseline = 'middle';

    context.strokeStyle = 'rgba(255,255,255, 0.7)';
    context.lineWidth = 4;
    context.strokeText(node.attr('dimension'), 5, node.attr('width') / 2);

    context.fillStyle = opt.plots.barLabel.color;
    context.fillText(node.attr('dimension'), 5, node.attr('width') / 2);

    context.restore();
}

const drawMetricOntTop = (context, node, opt)=> {
    context.save();

    context.translate(node.attr('x'), node.attr('y'));
    context.textAlign = "center";
    // context.textBaseline = 'middle';

    context.fillStyle = opt.plots.metricLabel.color;
    context.fillText(node.attr('metric'), node.attr('width')/2, -25, node.attr('width'));

    context.restore();
}

const drawRects =  (context, selection, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    selection.each(function(d){
        const node = select(this);
        context.beginPath();
        context.fillStyle = node.attr('fill');
        context.globalAlpha = node.attr('opacity');
        context.rect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'));
        context.fill();

        if (opt.plots.barLabel.enabled === true) drawVerticalLabel(context, node, opt);
        if (opt.plots.metricLabel.enabled === true) drawMetricOntTop(context, node, opt);
    });
}


class Bar extends AbstractCanvasChart {

    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._w = ()=>{
            if (isUndefined(this._getDimension().scale.bandwidth)
                || !isFunction(this._getDimension().scale.bandwidth)) {
                let evenWidth = Math.ceil(this._options.chart.innerWidth / this._data.length);

                return evenWidth > 1 ? evenWidth - 1 : 0.1
            } else {
                return this._getDimension().scale.bandwidth();
            }
        };
        this._h = d=>  this._options.chart.innerHeight - this._y(d);
        this._zero = ()=> this._getMetric().scale(0);
    }

    _animate() {
        this.drawDetachedBars();

        // timer((elapsed)=> {
        //     drawRects(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options)
        // });
    }


    drawDetachedBars() {
        const _hasNegative = super._hasNegativeValue();

        const drawCanvasInTransition = ()=> {
            return t=> {
                drawRects(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options);
            }};

        let bars = this._detachedContainer.selectAll('.bar').data(this._data);
        let dataJoin = bars.enter();
        let dataRemove = bars.exit();

        const exitTransition = transition()
            .duration(this._options.animation.duration.remove)
            .each(()=>{
                dataRemove
                    .transition()
                    .attr("y", _hasNegative ? this._y(0) : this._options.chart.innerHeight)
                    .attr("height", 0)
                    .tween("remove.rects", drawCanvasInTransition);

                dataRemove.remove();
            });

        const updateTransition = exitTransition.transition()
            .duration(this._options.animation.duration.update)
            .each(()=> {
                bars
                    .attr('dimension', this._getDimensionVal)
                    .attr('metric', this._getMetricVal)
                    .transition("update-rect-transition")
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.update)
                    .attr('fill', this._c)
                    .attr("x", this._x)
                    .attr('width', this._w)
                    .attr("y", d=> this._getMetricVal(d) > 0 ? this._y(d) : this._zero())
                    .attr("height", d=> _hasNegative
                        ? Math.abs( this._y(d) - this._zero() )
                        : this._h(d))
                    .tween("update.rects", drawCanvasInTransition);
            });

        const enterTransition = updateTransition.transition()
            .duration(this._options.animation.duration.add)
            .each(()=>{
                dataJoin.append("rect")
                    .attr('class', 'bar')
                    .attr('fill', this._c)
                    .attr('opacity', 1)
                    .attr("x", this._x)
                    .attr('width', this._w)
                    .attr('dimension', '')
                    .attr('metric', '')
                    .attr("y", _hasNegative ? this._zero(0) : this._options.chart.innerHeight)
                    .attr("height", 0)
                    .transition()
                    .duration(this._options.animation.duration.add)
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.add)
                    .attr("y", d=> this._getMetricVal(d) > 0 ? this._y(d) : this._zero())
                    .attr("height", d=> _hasNegative
                        ? Math.abs( this._y(d) - this._zero() )
                        : this._h(d))
                    .attr('dimension', this._getDimensionVal)
                    .attr('metric', this._getMetricVal)
                    .tween("append.rects", drawCanvasInTransition);
            });

        enterTransition.on('end', ()=> {
            // shadow color?
            /**
             * callback for when the mouse moves across the overlay
             */
            function mouseMoveHandler() {
                // get the current mouse position
                const [mx, my] = mouse(this);
                // closest to the mouse, limited by max distance voronoiRadius
                const closest = that._voronoi.find(mx, my, QuadtreeRadius);

                if (closest) {
                    that._tooltip
                        .html( that._getTooltipHTML(closest.data.data))
                        .transition()
                        .duration(that._options.animation.tooltip)
                        .style("opacity", 1)
                        .style("left", closest[0] + "px")
                        .style("top", closest[1] + "px");

                } else {
                    that._tooltip
                        .transition()
                        .duration(that._options.animation.tooltip)
                        .style("opacity", 0)
                }
            }

            function mouseOutHandler() {
                that._tooltip.style("opacity", 0)
            }

            that._frontCanvas.on('mousemove', mouseMoveHandler);
        })
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
        const _field = getSortDef(this._options);
        const _accessor = _field.accessor;

        this._detachedContainer.selectAll('.bar')
            .sort((a, b) => {
                if (_field.type === Globals.DataType.STRING) {
                    return (direction === 'asc')
                        ? a[_accessor].localeCompare(b[_accessor])
                        : b[_accessor].localeCompare(a[_accessor]);
                } else {
                    return (direction === 'asc')
                        ? a[_accessor] - b[_accessor]
                        : b[_accessor] - a[_accessor];
                }
            });

        this._detachedContainer.selectAll(".bar")
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> i / this._data.length * this._options.animation.duration.update)
            .attr("x", this._x);

        this.axes.update(this._svg, this._data);

        timer((elapsed)=> {
            drawRects(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options)
        });
    };

    createOptions(_userOptions) {
        return createCartesianOpt(BarOpt, _userOptions);
    }

    _isBar() {
        return true;
    }

}


export default Bar

