import { mouse } from 'd3-selection';
import { AbstractStackedCartesianChartWithAxes } from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';

import {
    GroupedOptions,
    StackedOptions,
    ExpandedOptions
} from './options';
import animateStates from './tween-states';


class StackedBar extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this.stackSwitched = false;
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

        const initialState = this.previousState
            ? this.previousState
            : this._options.plots.stackLayout === true
                ? this._data.nested.map(initialStackLayout)
                : this._data.nested.map(initialGroupLayout);

        const finalState = this._options.plots.stackLayout === true
            ? this._data.nested.map(mapStackLayout)
            : this._data.nested.map(mapGroupLayout);

        if (this.stackSwitched) {
            // reset stack layout dirty checker
            this.stackSwitched = false;

            const intrimState = this._options.plots.stackLayout === false
                ? this._data.nested.map(groupToStack)
                : this._data.nested.map(stackToGroup);

            animateStates(initialState, intrimState, 500, this._frontContext, this._options)
                .then(()=>{
                    this.update()
                });

            this.previousState = intrimState;
        } else {
            animateStates(initialState,
                finalState,
                this._options.animation.duration.update,
                this._frontContext,
                this._options);

            // cache finalState as the initial state of next animation call
            this.previousState = finalState;
        }

    }



    options(userOpt){
        if (userOpt && userOpt.plots
            && userOpt.plots.stackLayout !== this._options.plots.stackLayout) {
            this.stackSwitched = true;
        }

        return super.options(userOpt);
    }

    _updateLayout(opt) {
        this.options(opt);
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