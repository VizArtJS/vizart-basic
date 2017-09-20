import {
    pie,
    arc
} from 'd3-shape';
import { format } from 'd3-format';
import { sum } from 'd3-array';
import { interpolateArray } from 'd3-interpolate';
import { transition } from 'd3-transition';
import { timer } from 'd3-timer';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';
import { check, Globals } from 'vizart-core';

import createCartesianOpt from '../../options/createCartesianOpt';
import AbstractCanvasChart from '../../canvas/AbstractCanvasChart';
import TooltipTpl from '../../base/tooltip-tpl';

import midAngle from './mid-angle';
import getLinePosition from './get-line-position';
import getLabelPosition from './get-label-position';
import limitSliceValues from './limit-slice-values';

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const radius = Math.min(opt.chart.innerWidth, opt.chart.innerHeight) / 2;
    const innerArc = arc()
        .outerRadius(radius * 0.8)
        .innerRadius(() => opt.plots.isDonut ? radius * opt.plots.innerRadiusRatio : 0)
        .context(context);

    const outerArc = arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)
        .context(context);

    const _pie = pie()
        .sort(null)
        .value(d=>d.y);

    const slices = _pie(state);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    for (const s of slices) {
        context.beginPath();
        innerArc(s);
        context.fillStyle = s.data.c;
        context.fill();
    }

    context.restore();

}

const percentFormat = format(".00%");

const DefaultOptions = {
    chart: {
        type: 'pie'
    },
    plots: {
        othersTitle: 'Others',
        isDonut: false,
        innerRadiusRatio: 0.4
    },
    slice: {
        labelPosition: 'auto',
        labelMinPercentage: 0.01
    }
};

class Pie extends AbstractCanvasChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }


    _animate() {
        const Duration = this._options.animation.duration.update;

        this.minPct = this._options.slice.labelMinPercentage > 0
            ? this._options.slice.labelMinPercentage
            : 0.01;


        const initialState = this.previousState
            ? this.previousState
            : this._data.map(d=>{

                return {
                    x: this._x(d),
                    y: this._frontCanvas.node().height,
                    c: this._c(d),
                    alpha: 0,
                    data: d
                }
            });

        const finalState = this._data.map(d=>{
            console.log(this._c(d));
            return {
                x: this._x(d),
                y: this._y(d),
                c: this._c(d),
                alpha: this._options.plots.opacity,
                data: d
            }
        });

        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        const interpolateParticles = interpolateArray(initialState, finalState);

        let that = this;
        const batchRendering = timer( (elapsed)=> {
            const t = Math.min(1, easeCubic(elapsed / Duration));

            drawCanvas(that._frontContext,
                interpolateParticles(t),
                that._options);

            if (t === 1) {
                batchRendering.stop();


                /**
                 * callback for when the mouse moves across the overlay
                 */
                function mouseMoveHandler() {
                    // get the current mouse position
                    const [mx, my] = mouse(this);
                    const QuadtreeRadius = 100;
                    // use the new diagram.find() function to find the Voronoi site
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
                that._frontCanvas.on('mouseout', mouseOutHandler);

                // draw hidden in parallel;
                // drawPoints(that._hiddenContext,
                //     interpolateParticles(t),
                //     that._options, true);

                that._listeners.call('rendered');
            }
        });
    }



    donut(isDonut = false) {
        if (isDonut === false) {
            this._options.plots.isDonut = false;
        } else {
            this._options.plots.isDonut = true;
            this._options.plots.innerRadiusRatio = 0.4;
        }

        this.update();
    }

    data(_data) {
        if (check(_data) === true) {
            this.total = sum(_data, d => this._getMetricVal(d));
        }

        super.data(_data);
    }

    createOptions(_userOpt) {
        return createCartesianOpt(DefaultOptions, _userOpt);
    };

    _provideColor() {
        // pie's other slice may contain value out of range
        return super._provideColor().clamp(true);
    }
}


export default Pie