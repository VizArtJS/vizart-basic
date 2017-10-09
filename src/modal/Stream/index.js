import { check } from 'vizart-core';
import { min } from 'd3-array';
import { mouse } from 'd3-selection';
import { applyVoronoi } from 'vizart-core';

import { AbstractStackedCartesianChartWithAxes } from '../../base';
import { Stacks } from '../../data';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import animateStates from './tween-states';

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

class Stream extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate() {
        let _min = min(this._data.nested.map(d=> min(d.values.map(e => e.y0))));

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
                            key: d.key,
                            x: this._x(e.data),
                            y: e.y,
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
                        key: d.key,
                        x: this._x(e.data),
                        y: e.y,
                        y0: this._y0(e),
                        y1: this._y1(e),
                        data: e.data
                    }
                })
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
                that._voronoi = applyVoronoi(ctx, opt, res.reduce((acc, p)=>{
                        acc = acc.concat(p.values);
                        return acc;
                    }, []));

                /**
                 * callback for when the mouse moves across the overlay
                 */
                function mouseMoveHandler() {
                    // get the current mouse position
                    const [mx, my] = mouse(this);
                    const QuadtreeRadius = 40;
                    // use the new diagram.find() function to find the Voronoi site
                    // closest to the mouse, limited by max distance voronoiRadius
                    const closest = that._voronoi.find(mx, my, QuadtreeRadius);

                    if (closest) {
                        closest.data.data[that._getMetric().accessor] = closest.data.data[closest.data.key];
                        that._tooltip
                            .html( that.tooltip(closest.data.data))
                            .style("left", mx + opt.tooltip.offset[0] + "px")
                            .style("top", my + opt.tooltip.offset[0] + "px");

                        that._tooltip.style("opacity", 1)
                    } else {

                        that._tooltip.style("opacity", 0)
                    }
                }

                function mouseOutHandler() {
                    that._tooltip.style("opacity", 0)
                }

                that._frontCanvas.on('mousemove', mouseMoveHandler);
                that._frontCanvas.on('mouseout', mouseOutHandler);

                that._listeners.call('rendered');
        });
    }


    createOptions(_userOpt) {
        return createCartesianStackedOpt(DefaultOptions, _userOpt);
    };
}

export default Stream