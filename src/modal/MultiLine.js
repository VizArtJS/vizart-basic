import { AbstractStackedCartesianChartWithAxes } from '../base';
import { interpolateCurve } from 'vizart-core';
import { transition } from 'd3-transition';
import { easeCubicOut } from 'd3-ease';
import { line } from 'd3-shape';
import createCartesianStackedOpt from '../options/createCartesianStackedOpt';

const DefaultOptions = {
    chart: {
        type: 'line_multi'
    },
    plots: {
        curve: 'linear',
        strokeWidth: 3,
        dotRadius: 4
    }
};
class MultiLine extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._curve = line()
            .x(this._x)
            .y(this._y);

        this._baseLine = line()
            .x(this._x)
            .y(this._options.chart.innerHeight);
    }


    render(_data) {
        super.render(_data);
        this.update();
    }

    update() {
        super.update();

        // ease out line and link node
        this._svg.selectAll('.curve')
            .transition("ease-line-and-node")
            .duration(this._options.animation.duration.remove)
            .delay((d, i) => {
                return i / this._getDimension().values.length * this._options.animation.duration.remove;
            })
            .attr("d", (d) => {
                return this._baseLine(d.values);
            });

        this._svg.selectAll(".node")
            .transition("ease-line-and-node")
            .duration(this._options.animation.duration.remove)
            .attr('opacity', 0.2)
            .attr("cy", this._options.chart.innerHeight);

        interpolateCurve(this._options.plots.curve, [this._curve, this._baseLine]);

        let seriesUpdate = this._svg.selectAll(".series").data(this._data.nestedData);

        seriesUpdate.exit().remove();

        seriesUpdate.select('.curve')
            .attr("d", (d) => {
                return this._baseLine(d.values)
            })
            .transition("line-up-transition")
            .duration(this._options.animation.duration.update)
            .delay((d, i) => {
                return i / this._getDimension().values.length * this._options.animation.duration.update
            })
            .attr("d", (d) => {
                return this._curve(d.values)
            })
            .style('stroke-width', this._options.plots.strokeWidth);


        let linkNodes = seriesUpdate.selectAll(".node")
            .data((d) => {
                return d.values
            });

        linkNodes.exit()
            .transition("remove-line-node-transition")
            .duration(this._options.animation.duration.remove)
            .attr('opacity', 0)
            .remove();

        linkNodes
            .attr("cx", this._x)
            .transition("update-line-node-transition")
            .duration(this._options.animation.duration.remove)
            .delay((d, i) => {
                return i * 20;
            })
            .attr('opacity', 1)
            .attr("cy", this._y);

        linkNodes.enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", this._options.plots.dotRadius)
            .attr("cx", this._x)
            .attr("cy", this._options.chart.innerHeight)
            .attr('fill', this._c)
            .attr('opacity', 0.2)
            .transition("update-line-node-transition")
            .duration(this._options.animation.duration.update)
            .delay((d, i) => {
                return i * 20;
            })
            .attr("cy", this._y)
            .attr('opacity', 1);

        let addedSeries = seriesUpdate
            .enter().append("g")
            .attr("class", "servies");

        addedSeries.append("path")
            .style('stroke', this._c)
            .style('stroke-opacity', 1)
            .style('stroke-width', this._options.plots.strokeWidth)
            .style('fill', 'none')
            .attr("d", (d) => {
                return this._baseLine(d.values)
            })
            .attr('class', 'curve')
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i) => {
                return i / this._data.nestedData.length * this._options.animation.duration.update;
            })
            .ease(easeCubicOut)
            .attr("d", (d) => {
                return this._curve(d.values)
            });

        addedSeries.selectAll(".node")
            .data((d) => {
                return d.values;
            })
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", this._options.plots.dotRadius)
            .attr("cx", this._x)
            .attr("cy", this._options.chart.innerHeight)
            .attr('fill', this._c)
            .attr('opacity', 0)
            .transition().duration(this._options.animation.duration.update)
            .attr("cy", this._y)
            .attr('opacity', 1);

    }


    transitionColor (colorOptions) {
        super.transitionColor(colorOptions);

        let _trans = transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> {
                return i / this._data.nestedData.length * this._options.animation.duration.update;
            });

        this._svg.selectAll('.curve')
            .transition(_trans)
            .style('stroke', this._c);

        this._svg.selectAll(".node")
            .transition()
            .duration(this._options.animation.duration.remove)
            .attr('fill', this._c);
    };

    createOptions(_userOpt) {
        return createCartesianStackedOpt(DefaultOptions, _userOpt);
    };
}

export default MultiLine;