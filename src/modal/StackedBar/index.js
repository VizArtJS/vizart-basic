import { area } from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { hsl } from 'd3-color';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';
import applyVoronoi from '../../canvas/voronoi/apply';
import { AbstractStackedCartesianChartWithAxes } from '../../base';

import hasNegativeValue from '../../util/has-negative';

import {
    GroupedOptions,
    StackedOptions,
    ExpandedOptions
} from './StackedBar-Options';

const bardWidth = (opt, seriesNum)=> {
    const band = opt.data.x.scale.bandwidth();

    return opt.plots.stackLayout === true
        ? band
        : band / seriesNum;
}

const computeX = (x, seriesNum, seriesIndex, opt)=> {
    return opt.plots.stackLayout === true
        ? x
        : x + x / seriesNum * seriesIndex;
}

const barHeight = (opt, d)=> {
    return opt.plots.stackLayout === true
        ? d.y0 - d.y
        : opt.chart.innerHeight - d.y;
}


const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const universalWidth = bardWidth(opt, state.length);

    for (const [i, n] of state.entries()) {
        const color = n.c;
        const hslColorSpace = hsl(color);
        hslColorSpace.opacity = n.alpha;

        for (const b of n.values) {
            context.beginPath();
            context.fillStyle = hslColorSpace;
            const bx = computeX(b.x, state.length, i, opt);
            context.rect(bx, b.y, universalWidth, b.h);
            context.fill();
        }
    }
}

import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';

class StackedBar extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }


    _animate() {
        this._band = () => this._getDimension().scale.bandwidth();

        this._y = d => {
            return (this._options.plots.stackLayout === true)
                ? this._getMetric().scale(d.y)
                : this._getMetric().scale(this._getMetricVal(d));
        }

        this._h = d => {
            return (this._options.plots.stackLayout === true)
                ? this._getMetric().scale(d.y0) - this._getMetric().scale(d.y)
                : this._options.chart.innerHeight - this._y(d);
        }


        const Duration = this._options.animation.duration.update;

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
                            key: d.key,
                            x: this._x(e.data),
                            y: this._options.chart.innerHeight,
                            h: 0,
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
                        key: d.key,
                        x: this._x(e.data),
                        y: this._y(e.data),
                        h: this._h(e.data),
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
                //     that._options, finalState.reduce((acc, p)=>{
                //         acc = acc.concat(p.values);
                //         return acc;
                //     }, []));

                // that._quadtree = applyQuadtree(that._frontContext,
                //     that._options, finalState);

                /**
                 * callback for when the mouse moves across the overlay
                 */
                // function mouseMoveHandler() {
                //     // get the current mouse position
                //     const [mx, my] = mouse(this);
                //     const QuadtreeRadius = 40;
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
                //
                //         that._tooltip.style("opacity", 0)
                //     }
                // }
                //
                // function mouseOutHandler() {
                //
                //     that._tooltip.style("opacity", 0)
                // }
                //
                // that._frontCanvas.on('mousemove', mouseMoveHandler);
                // that._frontCanvas.on('mouseout', mouseOutHandler);
                //
                // that._listeners.call('rendered');
            }
        });

    }

    _updateLayout(_opt) {
        this._options.chart.type = _opt.chart.type;
        this._options.plots.stackLayout = _opt.plots.stackLayout;
        this._options.plots.stackMethod = _opt.plots.stackMethod;

        this.update();
    }


    stackLayout() {
        this._updateLayout(StackedOptions);
        this.update();
    };

    expandLayout() {
        this._updateLayout(ExpandedOptions);
        this.update();
    };

    groupedLayout() {
        this._updateLayout(GroupedOptions);
        this.update();
    };

    createOptions(_userOpt) {
        return createCartesianStackedOpt(GroupedOptions, _userOpt);
    };
}

export default StackedBar;