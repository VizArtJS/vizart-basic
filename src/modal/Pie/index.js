import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';
import {
    check,
    Globals
} from 'vizart-core';

import createCartesianOpt from '../../options/createCartesianOpt';
import AbstractCanvasChart from '../../canvas/AbstractCanvasChart';
import TooltipTpl from '../../base/tooltip-tpl';
import drawCanvas from './draw-canvas';
import drawHiddenCanvas from './draw-hidden-canvas';
import limitSliceValues from './limit-slice-values';

const DefaultOptions = {
    chart: {
        type: 'pie'
    },
    plots: {
        othersTitle: 'Others',
        isDonut: false,
        innerRadiusRatio: 0.4,
        labelOffset: 30,
        labelControlPointRadius: 6,
        labelPosition: 'auto',
        labelMinPercentage: 0.01
    },
};

class Pie extends AbstractCanvasChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }


    _animate() {
        const Duration = this._options.animation.duration.update;

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

        const interpolateParticles = interpolateArray(transformedInitial, transformedFinal);

        let that = this;
        const batchRendering = timer( (elapsed)=> {
            const t = Math.min(1, easeCubic(elapsed / Duration));

            drawCanvas(that._frontContext,
                interpolateParticles(t),
                that._options);

            if (t === 1) {
                batchRendering.stop();

                const colorMap = drawHiddenCanvas(that._hiddenContext,
                    transformedFinal,
                    that._options);
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
                        that._tooltip
                            .html( that._getTooltipHTML(node.data))
                            .transition()
                            .duration(that._options.animation.tooltip)
                            .style("opacity", 1)
                            .style("left", mx + "px")
                            .style("top", my + "px");

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

                that._listeners.call('rendered');
            }
        });
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