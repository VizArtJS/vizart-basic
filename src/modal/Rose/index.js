import { scaleLinear } from 'd3-scale';

import {AbstractStackedCartesianChart} from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import animateStates from "./tween-states";
import getRadius from '../Corona/get-radius';
import { Stacks } from '../../data';

const RoseOpt = {
    chart: {
        type: 'rose'
    },

    plots: {
        innerRadiusRatio: 0,
        outerRadiusMargin: 60,
        stackLayout: false, // stack areas
        stackMethod: Stacks.Zero,
    },

}
/**
 *
 *"Death is a great price to pay for a red rose," cried the Nightingale,
 * "and Life is very dear to all. It is pleasant to sit in the green wood,
 * and to watch the Sun in his chariot of gold, and the Moon in her chariot of pearl.
 * Sweet is the scent of the hawthorn, and sweet are the bluebells that hide in the valley,
 * and the heather that blows on the hill. Yet love is better than Life, and what is the heart
 * of a bird compared to the heart of a man?"
 *
 * @author Oscar Wilde <The Nightingale And The Rose>
 */
class Rose extends AbstractStackedCartesianChart {
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
                    alpha: 0,
                    strokeAlpha: this._options.plots.strokeOpacity,
                    values: d.values.map((e, i) => {
                        const angleScale = scaleLinear()
                            .domain([0, d.values.length])
                            .range([0, 2 * Math.PI]);

                        return {
                            key: d.key,
                            startAngle: angleScale(i),
                            endAngle: angleScale(i + 1),
                            r: innerRadius,
                            r0: innerRadius,
                            r1: innerRadius,
                            data: e.data,
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
                strokeAlpha: this._options.plots.strokeOpacity,
                values: d.values.map((e, i) => {
                    const angleScale = scaleLinear()
                        .domain([0, d.values.length])
                        .range([0, 2 * Math.PI]);

                    return {
                        key: d.key,
                        startAngle: angleScale(i),
                        endAngle: angleScale(i + 1),
                        r: radiusScale(e.y),
                        r0: rawRadiusScale(e.y0),
                        r1: rawRadiusScale(e.y1),
                        data: e.data,
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
            // that._voronoi = applyVoronoi(ctx, opt, finalState.reduce((acc, p)=>{
            //     acc = acc.concat(p.values.map(d=>{
            //         return {
            //             s: p.key,
            //             label: that._getDimensionVal(d.data),
            //             metric: d.data[p.key],
            //             x: d.r * Math.sin(d.angle) + opt.chart.width / 2,
            //             y: opt.chart.height - (d.r * Math.cos(d.angle) + opt.chart.height / 2),
            //             c: p.c,
            //             d: d,
            //             data: d.data
            //         }
            //     }));
            //     return acc;
            // }, []));


        });
    }

    createOptions(_userOpt) {
        return createCartesianStackedOpt(RoseOpt, _userOpt);
    };
}

export default Rose;