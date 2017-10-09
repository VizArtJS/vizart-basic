import { mouse } from 'd3-selection';

import { AbstractStackedCartesianChartWithAxes } from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import applyVoronoi from '../../canvas/voronoi/apply';
import drawCanvas from './draw-canvas';
import highlightLine from './highlight-line';
import animateStates from './tween-states';

const DefaultOptions = {
    chart: {
        type: 'line_multi'
    },
    plots: {
        curve: 'linear',
        strokeWidth: 3,
        showDots: false,
        dotRadius: 4
    }
};


class MultiLine extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate() {
        const Duration = this._options.animation.duration.update;

        const initialState = this.previousState
            ? this.previousState
            : this._data.nested.map(d => {
                return {
                    key: d.key,
                    c: this._c(d),
                    s: d.key,
                    alpha: 0,
                    values: d.values.map(e => {
                        return {
                            key: d.key,
                            x: this._x(e.data),
                            y: this._options.chart.innerHeight,
                            data: e.data
                        }
                    })
                }
            });

        const finalState = this._data.nested.map(d => {
            return {
                key: d.key,
                c: this._c(d),
                alpha: 1,
                values: d.values.map(e => {
                    return {
                        key: d.key,
                        x: this._x(e.data),
                        y: e.y,
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

            // that._quadtree = applyQuadtree(that._frontContext,
            //     that._options, finalState);

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
                    that._tooltip.style("left", closest[0] + "px")
                        .style("top", closest[1] + "px")
                        .html( that.tooltip(closest.data.data));

                    highlightLine(ctx, res, opt, closest.data);
                    that._tooltip.style("opacity", 1);
                } else {
                    that._tooltip.style("opacity", 0);

                    drawCanvas(ctx, res, opt);
                }
            }

            function mouseOutHandler() {
                that._tooltip.style("opacity", 0);
                drawCanvas(ctx, res, opt);
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

export default MultiLine;