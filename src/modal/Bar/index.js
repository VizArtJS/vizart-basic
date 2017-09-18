import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';

import {
    Globals,
    mergeOptions
} from 'vizart-core';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isFunction from 'lodash-es/isFunction';

import AbstractCanvasChart from '../../canvas/AbstractCanvasChart';
import createCartesianOpt from '../../options/createCartesianOpt';

const BarOpt = {
    chart: { type: 'bar_horizontal'}
};


const drawRects = (context, particles, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (const [i, p] of particles.entries()) {
        context.beginPath();
        context.fillStyle = p.c;
        context.globalAlpha = p.alpha;
        context.rect(p.x, p.y, p.w, p.h);
        context.fill();
    }
}

class Bar extends AbstractCanvasChart {

    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._w = ()=>{
            if (isUndefined(this._getDimension().scale.bandwidth)
                || !isFunction(this._getDimension().scale.bandwidth)) {
                let evenWidth = Math.ceil(this._options.chart.innerWidth / this._data.length);

                return evenWidth > 1 ? evenWidth - 1 : 0.1
            } else {
                return this._getDimension().scale.bandwidth();
            }
        };
        this._h = d=>  this._options.chart.innerHeight - this._y(d);
        this._zero = ()=> this._getMetric().scale(0);
    }

    _animate() {
        const Duration = this._options.animation.duration.update;

        const initialState = this.previousState
            ? this.previousState
            : this._data.map(d=>{

                return {
                    x: this._x(d),
                    y: this._frontCanvas.node().height,
                    w: this._w(d),
                    h: this._h(d),
                    c: this._c(d),
                    alpha: 0,
                    data: d
                }
            });

        const finalState = this._data.map(d=>{
            return {
                x: this._x(d),
                y: this._y(d),
                w: this._w(d),
                h: this._h(d),
                c: this._c(d),
                alpha: this._options.plots.opacity,
                data: d
            }
        });

        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        const interpolateStates = interpolateArray(initialState, finalState);

        let that = this;
        const batchRendering = timer( (elapsed)=> {
            const t = Math.min(1, easeCubic(elapsed / Duration));

            drawRects(that._frontContext,
                interpolateStates(t),
                that._options);

            if (t === 1) {
                batchRendering.stop();


                /**
                 * callback for when the mouse moves across the overlay
                 */
                function mouseMoveHandler() {
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

    createOptions(_userOptions) {
        return createCartesianOpt(BarOpt, _userOptions);
    }

    _isBar() {
        return true;
    }

}


export default Bar

