import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { hsl } from 'd3-color';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';
import { AbstractStackedCartesianChartWithAxes } from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import hasNegativeValue from '../../util/has-negative';

import {
    GroupedOptions,
    StackedOptions,
    ExpandedOptions
} from './StackedBar-Options';

const transparentColor = d => {
    const color = d.c;
    const hslColorSpace = hsl(color);
    hslColorSpace.opacity = d.alpha;

    return hslColorSpace;
}


const drawCanvas = (context, state)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (const n of state) {
        const color = transparentColor(n);

        for (const b of n.values) {
            context.beginPath();
            context.fillStyle = color;
            context.rect(b.x, b.y, b.w, b.h);
            context.fill();
        }
    }
}

class StackedBar extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }


    _animate() {
        const seriesNum = this._data.nested.length;
        const band = this._options.data.x.scale.bandwidth();
        const barWidth = band / seriesNum;

        const mapGroupLayout = (d, i)=> {
            return {
                key: d.key,
                c: this._c(d),
                alpha: this._options.plots.opacity,
                values: d.values.map(e=> {
                    return {
                        key: d.key,
                        x: this._x(e.data) + barWidth * i,
                        y: this._y(e.data),
                        w: barWidth,
                        h: this._options.chart.innerHeight - this._y(e.data),
                        data: e.data
                    }
                })
            }
        }

        const mapStackLayout = d => {
            return {
                key: d.key,
                c: this._c(d),
                alpha: this._options.plots.opacity,
                values: d.values.map(e=> {
                    return {
                        key: d.key,
                        x: this._x(e.data),
                        y: this._getMetric().scale(e.y0),
                        w: band,
                        h: this._getMetric().scale(e.y1) - this._getMetric().scale(e.y0),
                        data: e.data
                    }
                })
            }
        }

        const Duration = this._options.animation.duration.update;

        const initialState = this.previousState
            ? this.previousState
            : this._data.nested.map(d=>{
                return {
                    key: d.key,
                    c: this._c(d),
                    s: d.key,
                    alpha: this._options.plots.opacity,
                    values: d.values.map(e=> {
                        return {
                            key: d.key,
                            x: this._x(e.data),
                            y: this._options.chart.innerHeight,
                            h: 0,
                            w: barWidth,
                            data: e.data
                        }
                    })
                }
            });

        const finalState = this._options.plots.stackLayout === true
            ? this._data.nested.map(mapStackLayout)
            : this._data.nested.map(mapGroupLayout);


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
    };

    expandLayout() {
        this._updateLayout(ExpandedOptions);
    };

    groupedLayout() {
        this._updateLayout(GroupedOptions);
    };

    createOptions(_userOpt) {
        return createCartesianStackedOpt(GroupedOptions, _userOpt);
    };
}

export default StackedBar;