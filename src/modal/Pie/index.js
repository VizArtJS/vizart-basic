import { mouse } from 'd3-selection';
import { sum } from 'd3-array';
import isArray from 'lodash-es/isArray';
import {
    check,
    Globals
} from 'vizart-core';

import createCartesianOpt from '../../options/createCartesianOpt';
import AbstractBasicCartesianChart from '../../base/AbstractBasicCartesianChart';
import drawHiddenCanvas from './draw-hidden-canvas';
import limitSliceValues from './limit-slice-values';
import animateStates from './tween-states';

const DefaultOptions = {
    chart: {
        type: 'pie',
    },
    plots: {
        othersTitle: 'Others',
        isDonut: false,
        opacity: 0.8,
        innerRadiusRatio: 0.4,
        outerRadiusMargin: 30,
        labelOffset: 20,
        labelControlPointRadius: 6,
        labelPosition: 'auto',
        labelMinPercentage: 0.01
    },
};

class Pie extends AbstractBasicCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }


    _animate() {
        const initialState = this.previousState
            ? this.previousState
            : this._data.map(d=>{
                return {
                    y: 0,
                    c: this._c(d),
                    alpha: 0,
                    data: d,
                    p: '0%',
                    label: this._getDimensionVal(d)
                }
            });

        const finalState = this._data.map(d=>{
            return {
                y: this._y(d),
                c: this._c(d),
                alpha: this._options.plots.opacity,
                data: d,
                label: this._getDimensionVal(d),
                p: ''
            }
        });

        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        const transformedInitial = limitSliceValues(initialState, this._options, this._color);
        const transformedFinal = limitSliceValues(finalState, this._options, this._color);

        let that = this;
        const ctx = that._frontContext;
        const opt = that._options;

        animateStates(transformedInitial,
            transformedFinal,
            opt.animation.duration.update,
            ctx,
            opt).then(res=> {
                const colorMap = drawHiddenCanvas(that._hiddenContext,
                    res,
                    opt,
                    that);
                /**
                 * callback for when the mouse moves across the overlay
                 */
                function mouseMoveHandler() {
                    // get the current mouse position
                    const [mx, my] = mouse(this);
                    const col = that._hiddenContext.getImageData(mx * that._canvasScale, my * that._canvasScale, 1, 1).data;
                    const colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
                    const node = colorMap.get(colString);

                    if (node) {
                        let html;
                        if (isArray(node.data.data)) {
                            let n = {};
                            n[that._getDimension().accessor] = node.data.label;
                            n[that._getMetric().accessor] = sum(node.data.data.map(d=>d.data), that._getMetricVal);
                            html = that.tooltip(n);
                        } else {
                            html = that.tooltip(node.data.data);
                        }

                        that._tooltip
                            .html(html)
                            .transition()
                            .duration(that._options.animation.tooltip)
                            .style("left", mx + that._options.tooltip.offset[0] + "px")
                            .style("top", my + that._options.tooltip.offset[1] + "px")
                            .style("opacity", 1);
                    } else {
                        that._tooltip
                            .transition()
                            .duration(that._options.animation.tooltip)
                            .style("opacity", 0);
                    }
                }

                function mouseOutHandler() {
                    that._tooltip
                        .transition()
                        .duration(that._options.animation.tooltip)
                        .style("opacity", 0);
                }

                that._frontCanvas.on('mousemove', mouseMoveHandler);
                that._frontCanvas.on('mouseout', mouseOutHandler);

                that._listeners.call('rendered');
        });
    }


    createOptions(_userOpt) {
        return createCartesianOpt(DefaultOptions, _userOpt);
    };

    _provideColor() {
        // pie's other slice may contain value out of range
        return this._data.length > 1
            ? super._provideColor().clamp(true)
            : super._provideColor();
    }
}


export default Pie