import { mouse } from 'd3-selection';
import { AbstractStackedCartesianChartWithAxes } from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';

import {
    GroupedOptions,
    StackedOptions,
    ExpandedOptions
} from './options';
import animateStates from './tween-states';
import drawHiddenCanvas from './draw-hidden-canvas';


class StackedBar extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this.stackSwitched = false;
        this.colorMap;
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
                this._options)
                    .then(res=>{
                        this.colorMap = drawHiddenCanvas(this._hiddenContext, res);

                        console.log(this.colorMap);

                        let that = this;


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
                            const node = that.colorMap.get(colString);

                            if (node) {
                                that._tooltip
                                    .html(that.tooltip(node.data))
                                    .transition()
                                    .duration(that._options.animation.tooltip)
                                    .style("opacity", 1)
                                    .style("left", mx + that._options.tooltip.offset[0] + "px")
                                    .style("top", my + that._options.tooltip.offset[0] + "px")

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

                    }
                );

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