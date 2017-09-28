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

        const initialGroupLayout = (d,i)=> {
            return {
                key: d.key,
                c: this._c(d),
                alpha: this._options.plots.opacity,
                values: d.values.map(e=> {
                    return {
                        key: d.key,
                        x: this._x(e.data) + barWidth * i,
                        y: this._options.chart.innerHeight,
                        w: barWidth,
                        h: 0,
                        data: e.data
                    }
                })
            }
        }

        const initialStackLayout = d=> {
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
                        h: 0,
                        data: e.data
                    }
                })
            }
        }

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
            : this._options.plots.stackLayout === true
                ? this._data.nested.map(initialStackLayout)
                : this._data.nested.map(initialGroupLayout);

        const finalState = this._options.plots.stackLayout === true
            ? this._data.nested.map(mapStackLayout)
            : this._data.nested.map(mapGroupLayout);

        // cache finalState as the initial state of next animation call
        this.previousState = finalState;
        this.animateStates(initialState, finalState, Duration);

    }

    _updateLayout(opt) {
        const layoutDirty = this._options.plots.stackLayout !== opt.plots.stackLayout;
        // switch layout
        this._options.chart.type = opt.chart.type;
        this._options.plots.stackLayout = opt.plots.stackLayout;
        this._options.plots.stackMethod = opt.plots.stackMethod;

        const seriesNum = this._data.nested.length;
        const band = this._options.data.x.scale.bandwidth();
        const barWidth = band / seriesNum;
        // stacked => x and width => grouped (y and height)
        const stackToGroup = (d, i)=> {
            return {
                key: d.key,
                c: this._c(d),
                alpha: this._options.plots.opacity,
                values: d.values.map(e=> {
                    return {
                        key: d.key,
                        x: this._x(e.data) + barWidth * i,
                        y: this._getMetric().scale(e.y0),
                        w: barWidth,
                        h: this._getMetric().scale(e.y1) - this._getMetric().scale(e.y0),
                        data: e.data
                    }
                })
            }
        }

        // grouped => y and height => stacked (x and width)
        const groupToStack = (d, i) => {
            return {
                key: d.key,
                c: this._c(d),
                alpha: this._options.plots.opacity,
                values: d.values.map(e => {
                    return {
                        key: d.key,
                        x: this._x(e.data) + barWidth * i,
                        y: this._getMetric().scale(e.y0),
                        w: barWidth,
                        h: this._getMetric().scale(e.y1) - this._getMetric().scale(e.y0),
                        data: e.data
                    }
                })
            }
        }

        const intrimLayout = opt.plots.stackLayout === true
            ? this._data.nested.map(groupToStack)
            : this._data.nested.map(stackToGroup);

        if (layoutDirty) {
            this.animateStates(this.previousState, intrimLayout, 500).then(
                ()=> {
                    this.update();
                }
            );
            this.previousState = intrimLayout;
        } else {
            this.update();
        }
    }

    animateStates(initialState, finalState, duration) {
        let that = this;

        return new Promise((resolve, reject)=> {
            const interpolateParticles = interpolateArray(initialState, finalState);

            const batchRendering = timer( (elapsed)=> {
                const t = Math.min(1, easeCubic(elapsed / duration));

                drawCanvas(that._frontContext,
                    interpolateParticles(t),
                    that._options);

                if (t === 1) {
                    batchRendering.stop();
                    resolve();
                }
            });
        });
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