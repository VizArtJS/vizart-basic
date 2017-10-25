import {scaleLinear, scaleOrdinal} from 'd3-scale';
import { transition } from 'd3-transition';
import { select } from 'd3-selection';
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
        outerRadiusMargin: 10,
        axisLabelColor: 'black'
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
        const outerRadius = Math.min(this._options.chart.innerWidth / 2, this._options.chart.innerHeight / 2) - this._options.plots.outerRadiusMargin;
        const radiusScale = scaleLinear()
            .domain([0, this._data.maxY])
            .range([0, outerRadius]);
        // const radiusScale = scaleLinear()
        //     .domain([0, Math.sqrt(this._data.maxY*12 / Math.PI)])
        //     .range([0, Math.min(this._options.chart.innerWidth, this._options.chart.innerHeight)]);

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
                    r: radiusScale(e.values[i]._y),
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

        const that = this;
        const ctx = that._frontContext;
        const opt = that._options;

        if (!this.previousState) {
            const drawCanvasInTransition = function(d, i) {
                return t=> {
                    const currentTransform = select(this).attr('scale');
                    select(this).selectAll('.petal').attr('scale', currentTransform);
                    drawPetal(ctx, that._detachedContainer.selectAll('.petal'), opt);
                }};

            this._detachedContainer.attr("transform", "translate(" + (opt.chart.margin.left + opt.chart.innerWidth /2) + ","
                + (opt.chart.margin.top + opt.chart.innerHeight / 2) + ")");

            const dataUpdate = this._detachedContainer.selectAll('.petal-group').data(finalState);
            const dataJoin = dataUpdate.enter();

            const arcDiagram = arc()
                .startAngle(d=> d.startAngle)
                .endAngle(d=>d.endAngle)
                .innerRadius(0)
                .outerRadius(d=>d.r)
                .padAngle(.04);

            const groups = dataJoin.append("g")
                .attr('class', 'petal-group')
                .attr('scale', 0)
                .attr('transform', 'scale(0,0)');

            groups.selectAll('.petal')
                .data(d=>d.slice)
                .enter()
                .append('path')
                .attr("class", 'petal')
                .attr("series", d=> d.s)
                .attr("dimension", d=> this._getDimensionVal(d.data.data))
                .attr("d", arcDiagram)
                .attr('fill', d=> d.c)
                .attr('opacity', d=> d.alpha);


            groups.transition()
                .delay( 1000 )
                .duration((d,i)=> 300*i)
                .attr('scale', 1)
                .attr('transform', 'scale(1,1)')
                .tween("blooming.petal", drawCanvasInTransition);
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