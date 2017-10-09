import { mouse } from 'd3-selection';

import applyVoronoi from '../../canvas/voronoi/apply';
import { AbstractStackedCartesianChartWithAxes } from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import animateStates from './tween-states';

import {
    StackedOptions,
    AreaMultiOptions,
    ExpandedOptions
} from './options';


class StackedArea extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate() {
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
                            y0: this._y0(e),
                            y1: this._y1(e),
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
                        that._tooltip.style("left", closest[0] + "px")
                            .style("top", closest[1] + "px")
                            .html( that.tooltip(closest.data.data));

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
        this._updateLayout(AreaMultiOptions);
    };

    createOptions(_userOpt) {
        return createCartesianStackedOpt(StackedOptions, _userOpt);
    };

}

export default StackedArea;