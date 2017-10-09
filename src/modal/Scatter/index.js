import { mouse } from 'd3-selection';
import isNull from 'lodash-es/isNull';
import {
    Globals,
    applyVoronoi
} from 'vizart-core';
import AbstractBasicCartesianChartWithAxes from '../../base/AbstractBasicCartesianChartWithAxes';
import createCartesianOpt from '../../options/createCartesianOpt';
import updateRadiusScale from './update-radius-scale';
import animateStates from './tween-states';

const ScatterOptions = {
    chart: {
        type: 'scatter',
    },
    plots: {
        opacity: 1,
    },

    r: {
        scale: null,
        max: 20,
        min: 6,
        default: 8
    },

    data: {
        r: {
            accessor: null,
            type:  Globals.DataType.NUMBER,
            formatter:  null,
        },
    }
};


class Scatter extends AbstractBasicCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._getRadius = ()=> this._options.data.r;
        this._getRadiusValue = d=> d[this._getRadius().accessor];
        this._r = d => {
            return isNull(this._getRadius().scale)
                ? this._options.r.default
                : this._getRadius().scale(this._getRadiusValue(d));
        }
    }

    _animate() {
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
                alpha: this._options.plots.opacity,
                data: d
            }
        });

        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        let that = this;
        const ctx = that._frontContext;
        const opt = that._options;

        animateStates(initialState,
            finalState,
            opt.animation.duration.update,
            ctx,
            opt).then(res=> {
                that._voronoi = applyVoronoi(ctx, opt, res);

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
                        that._tooltip
                            .html( that.tooltip(closest.data.data))
                            .transition()
                            .duration(that._options.animation.tooltip)
                            .style("opacity", 1)
                            .style("left", closest[0] + "px")
                            .style("top", closest[1] + "px");

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

                // draw hidden in parallel;
                // drawPoints(that._hiddenContext,
                //     interpolateParticles(t),
                //     that._options, true);

                that._listeners.call('rendered');
        });
    }


    data(data) {
        if (data) {
            super.data(data);
            updateRadiusScale(this._options, data);
        }

        return this._data;
    }

    hexbinLayout() {
        drawHexbin(this._frontContext, this.previousState, this._options);
    }

    createOptions(_userOpt) {
        return createCartesianOpt(ScatterOptions, _userOpt);
    };
}

export default Scatter;