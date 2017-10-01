import { AbstractStackedCartesianChart } from '../../base';
import { wrapSVGText } from 'vizart-core'
import { CoronaOptions } from './Corona-Options';

import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import labelPrecision from './label-precision';

import { Stacks } from '../../data';


import { scaleLinear } from 'd3-scale';
import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';

import drawCanvas from './draw-canvas';
import applyVoronoi from '../../canvas/voronoi/apply';

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
                this._data.minY,
                this._data.maxY);

            if (t === 1) {
                batchRendering.stop();

                that._voronoi = applyVoronoi(that._frontContext,
                    that._options, finalState.reduce((acc, p)=>{
                        acc = acc.concat(p.values.map(d=>{
                            return {
                                s: p.key,
                                x: d.r * Math.sin(d.angle) + that._options.chart.width / 2,
                                y: d.r * Math.cos(d.angle) + that._options.chart.height / 2,
                                c: p.c,
                                data: d.data
                            }
                        }));
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
                            .style("top", closest[1]+ "px")
                            .html( that.tooltip(closest.data.data));

                        drawCanvas(that._frontContext,
                            finalState.map(d=>{
                                const p = d;
                                p.alpha = d.key === closest.data.s
                                    ? 0.6
                                    : 0.15;

                                return p;
                            }),
                            that._options,
                            innerRadius,
                            outerRadius,
                            that._data.minY,
                            that._data.maxY);
                        that._tooltip.style("opacity", 1);
                    } else {
                        that._tooltip.style("opacity", 0);

                        drawCanvas(that._frontContext,
                            interpolateParticles(t),
                            that._options,
                            innerRadius,
                            outerRadius,
                            that._data.minY,
                            that._data.maxY);
                    }
                }

                function mouseOutHandler() {
                    that._tooltip.style("opacity", 0);

                    drawCanvas(that._frontContext,
                        interpolateParticles(t),
                        that._options,
                        innerRadius,
                        outerRadius,
                        that._data.minY,
                        that._data.maxY);
                }

                that._frontCanvas.on('mousemove', mouseMoveHandler);
                that._frontCanvas.on('mouseout', mouseOutHandler);

                that._listeners.call('rendered');
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