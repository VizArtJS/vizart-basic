import { mouse } from 'd3-selection';
import {
    uuid,
    linearStops,
    applyVoronoi
} from 'vizart-core';

import AbstractBasicCartesianChartWithAxes from '../../base/AbstractBasicCartesianChartWithAxes';
import createCartesianOpt from '../../options/createCartesianOpt';
import animateStates from './tween-states';
import drawCanvas from './draw-canvas';
import highlightNode from './highlight-node';

const AreaOpt = {
    chart: {
        type: 'area_horizontal'
    },
    plots: {
        areaOpacity: 0.3,
        curve: 'basis',
        strokeWidth: 2,
        nodeRadius: 4,
        drawArea: true,
        showDots: true
    }
};


class Area extends AbstractBasicCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate() {
        const stops = linearStops(this._options.color.scheme);
        const nodeColor = stops[stops.length - 1].color;

        const initialState = this.previousState
            ? this.previousState
            : this._data.map(d=>{
                return {
                    x: this._x(d),
                    y: this._frontCanvas.node().height,
                    r: this._options.plots.nodeRadius,
                    c: nodeColor,
                    alpha: 0,
                    data: d
                }
        });

        const finalState = this._data.map(d=>{
            return {
                x: this._x(d),
                y: this._y(d),
                r: this._options.plots.nodeRadius,
                c: nodeColor,
                alpha: 1,
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
            opt).then(
            res => {
                this._voronoi = applyVoronoi(ctx, opt, res);
                // this._quadtree = applyQuadtree(ctx, opt, res);

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
                        that._tooltip.style("left", closest[0] + opt.tooltip.offset[0] + "px")
                            .style("top", closest[1] + opt.tooltip.offset[0] + "px")
                            .html( that.tooltip(closest.data.data));

                        that._tooltip.style("opacity", 1);

                        drawCanvas(ctx, res, opt, false);
                        highlightNode(ctx, opt, closest.data, closest[0], closest[1]);
                    } else {
                        that._tooltip.style("opacity", 0);
                        drawCanvas(ctx, res, opt, false);
                    }
                }

                function mouseOutHandler() {
                    that._tooltip.style("opacity", 0);
                    drawCanvas(ctx, res, opt, false);
                }

                that._frontCanvas.on('mousemove', mouseMoveHandler);
                that._frontCanvas.on('mouseout', mouseOutHandler);

                that._listeners.call('rendered');
            }
        );
    }

    createOptions(_userOpt) {
        return createCartesianOpt(AreaOpt, _userOpt);
    };
}


export default Area;