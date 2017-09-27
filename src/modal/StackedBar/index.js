import { transition } from 'd3-transition';

import { AbstractStackedCartesianChartWithAxes } from '../../base';
import hasNegativeValue from '../../util/has-negative';

import {
    GroupedOptions,
    StackedOptions,
    ExpandedOptions
} from './StackedBar-Options';

const drawRects =  (context, selection, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    selection.each(function(d){
        const node = select(this);
        context.beginPath();
        context.fillStyle = node.attr('fill');
        context.globalAlpha = node.attr('opacity');
        context.rect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'));
        context.fill();

        if (opt.plots.barLabel.enabled === true) drawVerticalLabel(context, node, opt);
        if (opt.plots.metricLabel.enabled === true) drawMetricOntTop(context, node, opt);
    });
}

import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';

class StackedBar extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._band = () => this._getDimension().scale.bandwidth();

        this._x = d => {
            let xPos = this._getDimension().scale(this._getDimensionVal(d));

            return (this._options.plots.stackLayout === true)
                ? xPos
                : xPos
                + this._band() / this._data.nested.length
                * this._options.data.s.values.indexOf(this._s(d));
        };

        this._y = d => {
            return (this._options.plots.stackLayout === true)
                ? this._getMetric().scale(d.y)
                : this._getMetric().scale(this._getMetricVal(d));
        }

        this._w = d => {
            return (this._options.plots.stackLayout === true)
                ? this._band()
                : this._band() / this._data.nested.length;
        }

        this._h = d => {
            return (this._options.plots.stackLayout === true)
                ? this._getMetric().scale(d.y0) - this._getMetric().scale(d.y)
                : this._options.chart.innerHeight - this._getMetric().scale(this._getMetricVal(d));
        }
    }


    _animate() {
        const dataUpdate = this._detachedContainer.selectAll(".series").data(this._data.nested);
        const dataRemove = dataUpdate.exit();
        const dataJoin = dataUpdate.enter();


        const hasNegative = hasNegativeValue(this._data.original, this._options);
        const drawCanvasInTransition = ()=> {
            return t => {
                drawRects(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options);
            }};

        const exitTransition = transition()
            .duration(this._options.animation.duration.remove)
            .each(()=>{
                dataRemove
                    .selectAll('.bar')
                    .transition()
                    .attr("y", hasNegative ? this._y(0) : this._options.chart.innerHeight)
                    .attr("height", 0)
                    .tween("remove.rects", drawCanvasInTransition);

                dataRemove.remove();
            });


        const updateTransition = exitTransition.transition()
            .duration(this._options.animation.duration.update)
            .each(()=> {
                dataUpdate
                    .selectAll('.bar')
                    .transition()
                    .duration(this._options.animation.duration.layout)
                    .delay((d, i) => i * 10)
                    .attr("x", this._x)
                    .attr("width", this._w)
                    .transition()
                    .attr("y", this._y)
                    .attr("height", this._h);
            });

        const enterTransition = updateTransition.transition()
            .duration(this._options.animation.duration.add)
            .each((d)=>{
                console.log(d);

                dataJoin.append("rect")
                    .data(d.values)
                    .enter()
                    .append("rect")
                    .attr('class', 'bar')
                    .attr('opacity', 1)
                    .attr("x", this._x)
                    .attr('width', this._w)
                    .attr("y", this._options.chart.innerHeight)
                    .attr("height", 0)
                    .transition()
                    .duration(this._options.animation.duration.add)
                    .delay((d, i) => i  / this._getDimension().values.length * this._options.animation.duration.add)
                    .attr("y", this._y)
                    .attr("height", this._h)
                    .tween("append.rects", drawCanvasInTransition);
            });
        // // UPDATE
        // let bars_update = dataUpdate.selectAll('.bar')
        //     .data((d) => {
        //         return d.values;
        //     });
        //
        // if (this._options.plots.stackLayout === true) {
        //     bars_update.transition()
        //         .duration(this._options.animation.duration.layout)
        //         .delay((d, i) => {
        //             return i * 10;
        //         })
        //         .attr("x", this._x)
        //         .attr("width", this._w)
        //         .transition()
        //         .attr("y", this._y)
        //         .attr("height", this._h);
        // } else {
        //     bars_update.transition()
        //         .duration(this._options.animation.duration.layout)
        //         .delay((d, i) => {
        //             return i * 10;
        //         })
        //         .attr("y", this._y)
        //         .attr("height", this._h)
        //         .transition()
        //         .attr("x", this._x)
        //         .attr("width", this._w);
        // }
        //
        // bars_update.exit()
        //     .transition("remove-rect-transition")
        //     .duration(this._options.animation.duration.add)
        //     .delay((d, i) => {
        //         return i * 100;
        //     })
        //     .attr("height", 0)
        //     .attr("y", this._options.chart.innerHeight)
        //     .remove();
        //
        //
        // bars_update.enter()
        //     .append("rect")
        //     .attr('class', 'bar')
        //     .attr('opacity', 1)
        //     .attr("x", this._x)
        //     .attr("width", this._w)
        //     .attr("y", this._options.chart.innerHeight)
        //     .attr("height", 0)
        //     .transition("add-rect-transition")
        //     .duration(this._options.animation.duration.add)
        //     .delay((d, i) => {
        //         return i / this._getDimension().values.length * this._options.animation.duration.add;
        //     })
        //     .attr("y", this._y)
        //     .attr("height", this._h);
        //
        //
        //

    }

    _updateLayout(_opt) {
        this._options.chart.type = _opt.chart.type;
        this._options.plots.stackLayout = _opt.plots.stackLayout;
        this._options.plots.stackMethod = _opt.plots.stackMethod;

        this.update();
    }


    stackLayout() {
        this._updateLayout(StackedOptions);
        this.update();
    };

    expandLayout() {
        this._updateLayout(ExpandedOptions);
        this.update();
    };

    groupedLayout() {
        this._updateLayout(GroupedOptions);
        this.update();
    };

    createOptions(_userOpt) {
        return createCartesianStackedOpt(GroupedOptions, _userOpt);
    };
}

export default StackedBar;