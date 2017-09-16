import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';

import { Globals } from 'vizart-core';
import AbstractCanvasChart from '../../canvas/AbstractCanvasChart';
import applyQuadtree from '../../canvas/quadtree/apply';
import applyVoronoi from '../../canvas/voronoi/apply';
import createCartesianOpt from '../../options/createCartesianOpt';


const ScatterOptions = {
    chart: {
        type: 'scatter',
    },
    plots: {
        blur: false,
        opacity: 1,
        bubble: {
            min: 6,
            max: 20,
            default: 8
        }
    },

    zAxis: {
        allowDecimals: false,
        scale: null,
        max: 100,
        min: 0,
    },

    data: {
        z: {
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

class Scatter extends AbstractCanvasChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._getRadius = ()=> {
            return this._options.data.z;
        };

        this._getRadiusValue = (d)=> {
            return (this._getRadius() && this._getRadius().accessor)
                ? d[this._getRadius().accessor]
                : null;
        };

        this._r = (d)=> {
            return (this._getRadius() && this._getRadius().accessor)
                ? this._getRadius().scale(this._getRadiusValue(d))
                : this._options.plots.bubble.default;
        }


        this._refreshZScale = ()=> {
            if (this._getRadius() && this._getRadius().accessor) {
                this._getRadius().scale.range(
                    [this._options.plots.bubble.min, this._options.plots.bubble.max]
                )
            }
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
                alpha: 1,
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
                        that._tooltip.style("left", closest[0] + "px")
                            .style("top", closest[1] + "px")
                            .html( that._getTooltipHTML(closest.data.data));

                        that._tooltip.style("opacity", 1)
                    } else {
                        that._tooltip.style("opacity", 0)
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


    createOptions(_userOpt) {
        return createCartesianOpt(ScatterOptions, _userOpt);
    };
}

export default Scatter;