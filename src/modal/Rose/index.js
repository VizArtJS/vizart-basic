import {scaleLinear, scaleOrdinal} from 'd3-scale';
import { transition } from 'd3-transition';
import {AbstractStackedCartesianChart} from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import animateStates from "./tween-states";
import getRadius from '../Corona/get-radius';
import {Stacks} from '../../data';
import { arc } from 'd3-shape';
import drawPetal from './draw-petal';

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

        const finalState = this._getDimension().values.map((d, i) => {
            let array = this._data.nested.map(e=> {
                return {
                    key: e.key,
                    s: e.key,
                    c: c(e.key),
                    alpha: this._options.plots.opacity,
                    startAngle: angleScale(i),
                    endAngle: angleScale(i + 1),
                    r: radiusScale(e.values[i].y),
                    data: e.values[i],
                }
            });

            // larger slice are drawn first
            array.sort((a, b) => b.r - a.r);

            return {
                dimension: d,
                slice: array
            }
        });

        let that = this;
        const ctx = that._frontContext;
        const opt = that._options;



        if (!this.previousState) {
            const drawCanvasInTransition = ()=> {
                return t=> {
                    drawPetal(this._frontContext, this._detachedContainer.selectAll('.petal'), this._options);
                }};

            const dataUpdate = this._detachedContainer.selectAll('.petal-group').data(finalState);
            const dataJoin = dataUpdate.enter();
            const dataRemove = dataUpdate.exit();

            const initArc = arc()
                .startAngle(d=> d.startAngle)
                .endAngle(d=>d.endAngle)
                .innerRadius(0)
                .outerRadius(0)
                .padAngle(.04);

            const arcDiagram = arc()
                .startAngle(d=> d.startAngle)
                .endAngle(d=>d.endAngle)
                .innerRadius(0)
                .outerRadius(d=>d.r)
                .padAngle(.04);

            const dataJoinTransition = transition()
                .duration(this._options.animation.duration.update)
                .delay((d, i) => i * 200)
                .each(()=>{
                    const petalGroup = dataJoin.append("g")
                        .attr('class', 'petal-group');

                    petalGroup.selectAll('.petal').data(d=>d.slice)
                        .enter()
                        .append('path')
                        .attr("class", 'petal')
                        .attr("d", initArc)
                        .attr('opacity', d=> d.alpha)
                        .attr('fill', d=> d.c)
                        .transition()
                        .duration(1000)
                        .delay((d, i) => i * 100)
                        .attr("d", arcDiagram)
                        .tween("blooming.petal", drawCanvasInTransition);
                });


            // const initialState = getInitialState(this._getDimension().values, this._data.nested, opt, c);
            // drawBloomingRose(initialState, finalState, ctx, opt);
        } else {
            animateStates(this.previousState,
                finalState,
                opt.animation.duration.update,
                ctx,
                opt).then(res=>{
            });
        }

        this.previousState = finalState;



    }

    createOptions(_userOpt) {
        return createCartesianStackedOpt(RoseOpt, _userOpt);
    };
}

export default Rose;