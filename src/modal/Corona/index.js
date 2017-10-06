import { scaleLinear } from 'd3-scale';
import { mouse } from 'd3-selection';
import cloneDeep from 'lodash-es/cloneDeep';

import { AbstractStackedCartesianChart } from '../../base';
import { CoronaOptions } from './Corona-Options';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import { Stacks } from '../../data';
import applyVoronoi from '../../canvas/voronoi/apply';

import drawCanvas from './draw-canvas';
import highlight from './highlight';
import transparentColor from "./get-transparent-color";
import getRadius from './get-radius';
import animateStates from "./tween-states";

class Corona extends AbstractStackedCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate() {
        const [innerRadius, outerRadius] = getRadius(this._options);
        const dataRange = [this._data.minY, this._data.maxY];
        const radiusScale = scaleLinear()
            .domain(dataRange.map(d=>this._getMetric().scale(d)))
            .range([innerRadius, outerRadius]);

        const rawRadiusScale = radiusScale.copy().domain(dataRange);

        const initialState = this.previousState
            ? this.previousState
            : this._data.nested.map(d => {
                return {
                    key: d.key,
                    c: this._c(d),
                    s: d.key,
                    range: dataRange,
                    alpha: 0,
                    strokeAlpha: this._options.plots.strokeOpacity,
                    values: d.values.map((e, i) => {
                        return {
                            key: d.key,
                            angle: Math.PI * 2 * i / d.values.length,
                            r: innerRadius,
                            r0: innerRadius,
                            r1: innerRadius,
                            data: e.data,
                            d: e
                        }
                    })
                }
            });

        const finalState = this._data.nested.map(d => {
            return {
                key: d.key,
                c: this._c(d),
                s: d.key,
                range: dataRange,
                alpha: this._options.plots.areaOpacity,
                strokeAlpha: this._options.plots.strokeOpacity,
                values: d.values.map((e, i) => {
                    return {
                        key: d.key,
                        angle: Math.PI * 2 * i / d.values.length,
                        r: radiusScale(e.y),
                        r0: rawRadiusScale(e.y0),
                        r1: rawRadiusScale(e.y1),
                        data: e.data,
                        d: e
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
            opt).then(res=>{
            that._voronoi = applyVoronoi(ctx, opt, finalState.reduce((acc, p)=>{
                acc = acc.concat(p.values.map(d=>{
                    return {
                        s: p.key,
                        label: that._getDimensionVal(d.data),
                        metric: d.data[p.key],
                        x: d.r * Math.sin(d.angle) + opt.chart.width / 2,
                        y: opt.chart.height - (d.r * Math.cos(d.angle) + opt.chart.height / 2),
                        c: p.c,
                        d: d,
                        data: d.data
                    }
                }));
                return acc;
            }, []));

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
                    const fadeOpacity = 0.1;

                    const optCopy = cloneDeep(opt);
                    optCopy.plots.levelColor = transparentColor(optCopy.plots.levelColor, fadeOpacity);
                    optCopy.plots.strokeOpacity = 0;

                    drawCanvas(ctx,
                        finalState.map(d=>{
                            const p = d;
                            p.alpha = d.key === closest.data.s
                                ? 0.4
                                : fadeOpacity;

                            p.strokeAlpha = d.key === closest.data.s
                                ? 1
                                : 0;

                            return p;
                        }),
                        optCopy);

                    highlight(ctx, opt, closest.data);
                } else {
                    drawCanvas(ctx, res, opt);
                }
            }

            function mouseOutHandler() {
                drawCanvas(ctx, res, opt);
            }

            that._frontCanvas.on('mousemove', mouseMoveHandler);
            that._frontCanvas.on('mouseout', mouseOutHandler);

            that._listeners.call('rendered');
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