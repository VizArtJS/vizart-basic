import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';
import isNull from 'lodash-es/isNull';

import { Globals } from 'vizart-core';
import AbstractCanvasChart from '../../canvas/AbstractCanvasChart';
import applyQuadtree from '../../canvas/quadtree/apply';
import applyVoronoi from '../../canvas/voronoi/apply';
import createCartesianOpt from '../../options/createCartesianOpt';
import updateRadiusScale from './update-radius-scale';
import hexbinLayout from './hexbin-layout';
import tooltipMarkup from "../../canvas/tooltip";

const ScatterOptions = {
    chart: {
        type: 'scatter',
    },
    plots: {
        opacity: 1,
    },

    r: {
        scale: null,
        max: 20,
        min: 6,
        default: 8
    },

    data: {
        r: {
            accessor: null,
            type:  Globals.DataType.NUMBER,
            formatter:  null,
        },
    }
};

const drawPoints = (context, particles, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (const [i, p] of particles.entries()) {
        context.beginPath();
        context.fillStyle = p.c;
        context.globalAlpha = p.alpha;
        context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        context.fill();
    }
}

const drawHexbin = (context, particles, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const hexLayout = hexbinLayout()
        .x(d=>d.x)
        .y(d=>d.y)
        .size([context.canvas.width, context.canvas.height])
        .radius(20);
    hexLayout.context(context);
    const hexagons = hexLayout(particles);

    for (const h of hexagons) {
        context.save();
        context.fillStyle = 'red';
        context.translate(h.x, h.y);
        hexLayout.hexagon(20);
        context.fill();
        context.restore();
    }

}


class Scatter extends AbstractCanvasChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._getRadius = ()=> this._options.data.r;
        this._getRadiusValue = d=> d[this._getRadius().accessor];
        this._r = d => {
            return isNull(this._getRadius().scale)
                ? this._options.r.default
                : this._getRadius().scale(this._getRadiusValue(d));
        }

    }

    _animate() {
        const Duration = this._options.animation.duration.update;

        const initialState = this.previousState
            ? this.previousState
            : this._data.map(d=>{

                return {
                    x: this._x(d),
                    y: this._frontCanvas.node().height,
                    r: this._r(d),
                    c: this._c(d),
                    alpha: 0,
                    data: d
                }
            });

        const finalState = this._data.map(d=>{
            return {
                x: this._x(d),
                y: this._y(d),
                r: this._r(d),
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

            drawPoints(that._frontContext,
                interpolateParticles(t),
                that._options);

            if (t === 1) {
                batchRendering.stop();


                for (let d of finalState) {
                    d._ = {
                        x: that._getDimensionVal(d.data),
                        y: that._getMetricVal(d.data),
                        metric: that._getMetric().name,
                        style: `border-color: ${d.c};`
                    }
                }

                that._voronoi = applyVoronoi(that._frontContext,
                    that._options, finalState);

                that._quadtree = applyQuadtree(that._frontContext,
                    that._options, finalState);

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
                            .html( tooltipMarkup(closest.data._))
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


    data(data) {
        if (data) {
            super.data(data);
            updateRadiusScale(this._options, data);
        }

        return this._data;
    }

    hexbinLayout() {
        drawHexbin(this._frontContext, this.previousState, this._options);
    }

    createOptions(_userOpt) {
        return createCartesianOpt(ScatterOptions, _userOpt);
    };
}

export default Scatter;