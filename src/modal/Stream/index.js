import { check } from 'vizart-core';
import { min } from 'd3-array';
import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { hsl } from 'd3-color';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';
import { area, curveCardinal } from 'd3-shape';

import { AbstractStackedCartesianChartWithAxes } from '../../base';
import { Stacks } from '../../data';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';


const DefaultOptions = {
    chart: {
        type: 'stream',
    },
    plots: {
        stackLayout: true,
        stackMethod: Stacks.Wiggle,
        opacityArea: 0.7,
        dotRadius: 8
    }
};


const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const curve = area()
        .x(d => d.x)
        .y0(d => d.y0)
        .y1(d => d.y1)
        .curve(curveCardinal)
        .context(context);

    for (const n of state) {
        const color = n.c;
        const hslColorSpace = hsl(color);
        hslColorSpace.opacity = n.alpha;

        context.beginPath();
        curve(n.values);
        context.lineWidth = opt.plots.strokeWidth;
        context.strokeStyle = color;
        context.stroke();

        context.fillStyle = hslColorSpace;

        context.fill();
        context.closePath();
    }
}

class Stream extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate() {
        const Duration = this._options.animation.duration.update;
        let _min = min(this._data.nested.map((d) => {
            return min(d.values.map((d) => {
                return d.y0;
            }));
        }));

        this._getMetric().scale.domain([_min, this._data.maxY]);

        const initialState = this.previousState
            ? this.previousState
            : this._data.nested.map(d=>{
                return {
                    key: d.key,
                    c: this._c(d),
                    s: d.key,
                    alpha: 0,
                    values: d.values.map(e=> {
                        return {
                            x: this._x(e.data),
                            y0: this._options.chart.innerHeight / 2,
                            y1: this._options.chart.innerHeight / 2,
                            data: e.data
                        }
                    })
                }
            });

        const finalState = this._data.nested.map(d=>{
            return {
                key: d.key,
                c: this._c(d),
                alpha: this._options.plots.opacityArea,
                values: d.values.map(e=> {
                    return {
                        x: this._x(e.data),
                        y0: this._y0(e),
                        y1: this._y1(e),
                        data: e.data
                    }
                })
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

                // that._voronoi = applyVoronoi(that._frontContext,
                //     that._options, finalState);
                //
                // that._quadtree = applyQuadtree(that._frontContext,
                //     that._options, finalState);

                /**
                 * callback for when the mouse moves across the overlay
                 */
                // function mouseMoveHandler() {
                //     // get the current mouse position
                //     const [mx, my] = mouse(this);
                //     const QuadtreeRadius = 100;
                //     // use the new diagram.find() function to find the Voronoi site
                //     // closest to the mouse, limited by max distance voronoiRadius
                //     const closest = that._voronoi.find(mx, my, QuadtreeRadius);
                //
                //     if (closest) {
                //         that._tooltip.style("left", closest[0] + "px")
                //             .style("top", closest[1] + "px")
                //             .html( that.tooltip(closest.data.data));
                //
                //         that._tooltip.style("opacity", 1)
                //     } else {
                //         that._tooltip.style("opacity", 0)
                //     }
                // }
                //
                // function mouseOutHandler() {
                //     that._tooltip.style("opacity", 0)
                // }
                //
                // that._frontCanvas.on('mousemove', mouseMoveHandler);
                // that._frontCanvas.on('mouseout', mouseOutHandler);
                //
                // // draw hidden in parallel;
                // draw(that._hiddenContext,
                //     interpolateParticles(t),
                //     that._options, true);
                //
                // that._listeners.call('rendered');
            }
        });
    }


    createOptions(_userOpt) {
        return createCartesianStackedOpt(DefaultOptions, _userOpt);
    };
}

export default Stream