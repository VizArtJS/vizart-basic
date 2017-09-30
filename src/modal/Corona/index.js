import { AbstractStackedCartesianChart } from '../../base';
import { wrapSVGText } from 'vizart-core'
import { CoronaOptions } from './Corona-Options';

import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import labelPrecision from './label-precision';

import { Stacks } from '../../data';


import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { range, extent } from 'd3-array';


import isNumber from 'lodash-es/isNumber';

import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { hsl } from 'd3-color';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';

import drawCanvas from './draw-canvas';

class Corona extends AbstractStackedCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate() {
        const outerRadius = Math.min(this._options.chart.innerWidth / 2, this._options.chart.innerHeight / 2) - this._options.plots.outerRadiusMargin;
        const innerRadius = outerRadius * this._options.plots.innerRadiusRatio;
        const radiusScale = scaleLinear()
            .domain([this._getMetric().scale(this._data.minY), this._getMetric().scale(this._data.maxY)])
            .range([innerRadius, outerRadius]);

        const rawRadiusScale = radiusScale.copy().domain([this._data.minY, this._data.maxY]);


        const Duration = this._options.animation.duration.update;

        const initialState = this.previousState
            ? this.previousState
            : this._data.nested.map(d => {
                return {
                    key: d.key,
                    c: this._c(d),
                    s: d.key,
                    alpha: 0,
                    values: d.values.map((e, i) => {
                        return {
                            key: d.key,
                            angle: Math.PI * 2 * i / d.values.length,
                            r: innerRadius,
                            r0: innerRadius,
                            r1: innerRadius,
                            data: e.data
                        }
                    })
                }
            });

        const finalState = this._data.nested.map(d => {
            return {
                key: d.key,
                c: this._c(d),
                s: d.key,
                alpha: this._options.plots.areaOpacity,
                values: d.values.map((e, i) => {
                    return {
                        key: d.key,
                        angle: Math.PI * 2 * i / d.values.length,
                        r: radiusScale(e.y),
                        r0: rawRadiusScale(e.y0),
                        r1: rawRadiusScale(e.y1),
                        data: e.data
                    }
                })
            }
        });
        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        const interpolateParticles = interpolateArray(initialState, finalState);

        let that = this;
        const batchRendering = timer((elapsed) => {
            const t = Math.min(1, easeCubic(elapsed / Duration));

            drawCanvas(that._frontContext,
                interpolateParticles(t),
                that._options,
                innerRadius,
                outerRadius,
                radiusScale.domain()[0],
                radiusScale.domain()[1]);

            if (t === 1) {
                batchRendering.stop();

                // that._voronoi = applyVoronoi(that._frontContext,
                //     that._options, finalState.reduce((acc, p)=>{
                //         acc = acc.concat(p.values);
                //         return acc;
                //     }, []));
                //
                // // that._quadtree = applyQuadtree(that._frontContext,
                // //     that._options, finalState);
                //
                // /**
                //  * callback for when the mouse moves across the overlay
                //  */
                // function mouseMoveHandler() {
                //     // get the current mouse position
                //     const [mx, my] = mouse(this);
                //     const QuadtreeRadius = 100;
                //     // use the new diagram.find() function to find the Voronoi site
                //     // closest to the mouse, limited by max distance voronoiRadius
                //     const closest = that._voronoi.find(mx, my, QuadtreeRadius);
                //     if (closest) {
                //         that._tooltip.style("left", closest[0] + "px")
                //             .style("top", closest[1] + "px")
                //             .html( that.tooltip(closest.data.data));
                //
                //         highlightLine(that._frontContext,
                //             interpolateParticles(t),
                //             that._options,
                //             closest.data);
                //         that._tooltip.style("opacity", 1);
                //     } else {
                //         that._tooltip.style("opacity", 0);
                //
                //         drawCanvas(that._frontContext,
                //             interpolateParticles(t),
                //             that._options);
                //     }
                // }
                //
                // function mouseOutHandler() {
                //     that._tooltip.style("opacity", 0);
                //
                //     drawCanvas(that._frontContext,
                //         interpolateParticles(t),
                //         that._options);
                // }
                //
                // that._frontCanvas.on('mousemove', mouseMoveHandler);
                // that._frontCanvas.on('mouseout', mouseOutHandler);
                //
                // that._listeners.call('rendered');
            }
        });

    }


    stackLayout() {
        this._options.plots.stackLayout = true;
        this._options.plots.stackMethod = Stacks.Zero;

        this.update();
    };

    expandLayout() {
        this._options.plots.stackLayout = true;
        this._options.plots.stackMethod = Stacks.Expand;

        this.update();
    };

    groupedLayout() {
        this._options.plots.stackLayout = false;

        this.update();
    };

    createOptions(_userOpt) {
        return createCartesianStackedOpt(CoronaOptions, _userOpt);
    };
}

export default Corona;