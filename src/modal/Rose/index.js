import {scaleLinear, scaleOrdinal} from 'd3-scale';

import {AbstractStackedCartesianChart} from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import animateStates from "./tween-states";
import getRadius from '../Corona/get-radius';
import {Stacks} from '../../data';
import drawCanvas from './draw-canvas';
import groupBy from 'lodash-es/groupBy';

const RoseOpt = {
    chart: {
        type: 'rose'
    },

    plots: {
        opacity: 0.5,
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
        const colorScale = scaleOrdinal().range(this._color.range());
        const c = d => colorScale(d);
        const [innerRadius, outerRadius] = getRadius(this._options);
        const dataRange = [this._data.minY, this._data.maxY];
        const radiusScale = scaleLinear()
            .domain(dataRange.map(d => this._getMetric().scale(d)))
            .range([20, outerRadius]);

        const sliceNum = this._getDimension().values.length;
        const angleScale = scaleLinear()
            .domain([0, sliceNum])
            .range([0, 2 * Math.PI]);

        const initialState = this.previousState
            ? this.previousState
            : this._getDimension().values.map((d, i) => {
            let array = new Array();

            for (let d of this._data.nested) {
                array.push({
                    key: d.key,
                    s: d.key,
                    c: c(d.key),
                    alpha: this._options.plots.opacity,
                    startAngle: angleScale(i),
                    endAngle: angleScale(i + 1),
                    r: 0,
                    data: d.values[i],
                });
            }

            // larger slice are drawn first
            array.sort((a, b) => b.data.y - a.data.y);

            return {
                dimension: d,
                slice: array
            }
        });

        const finalState = this._getDimension().values.map((d, i) => {
            let array = new Array();

            for (let d of this._data.nested) {
                array.push({
                    key: d.key,
                    s: d.key,
                    c: c(d.key),
                    alpha: this._options.plots.opacity,
                    startAngle: angleScale(i),
                    endAngle: angleScale(i + 1),
                    r: radiusScale(d.values[i].y),
                    data: d.values[i],
                });
            }

            // larger slice are drawn first
            array.sort((a, b) => b.r - a.r);

            return {
                dimension: d,
                slice: array
            }
        });



        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        let that = this;
        const ctx = that._frontContext;
        const opt = that._options;


        // animateStates(initData, data, opt.animation.duration.update, ctx, opt);
        // drawCanvas(ctx, finalState, opt);

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