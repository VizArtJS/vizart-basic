import { AbstractStackedCartesianChartWithAxes } from '../base';
import { check } from 'vizart-core';
import { Stacks } from '../data';
import { prepareCartesianStacked } from '../data';
import { min } from 'd3-array';
import { area, curveCardinal } from 'd3-shape';
import createCartesianStackedOpt from '../options/createCartesianStackedOpt';


const DefaultOptions = {
    chart: {
        type: 'stream',
    },
    plots: {
        stackLayout: true,
        stackMethod: Stacks.Wiggle,
        opacityArea: 0.7,
        dotRadius: 8
    }
};

class Stream extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    render(_data) {
        super.render(_data);
        this.update();
    }

    update() {
        super.update();

        this._baseLine = area()
            .curve(curveCardinal)
            .x(this._x)
            .y0(this._options.chart.innerHeight / 2)
            .y1(this._options.chart.innerHeight / 2);

        this._curve = area()
            .curve(curveCardinal)
            .x(this._x)
            .y0(this._y0)
            .y1(this._y1);


        let series_updated = this._svg.selectAll(".series")
            .data(this._data.nestedData);


        // EXIT
        let exitSeries = series_updated.exit();

        exitSeries.select('.curve')
            .transition()
            .duration(this._options.animation.duration.remove)
            .attr("d", (d) => {
                return this._baseLine(d.values);
            });

        exitSeries.remove();

        // UPDATE
        series_updated.select('.curve')
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i) => {
                return i / this._getDimension().values.length * this._options.animation.duration.update
            })
            .attr("d", (d) => {
                return this._curve(d.values)
            })
            .style('stroke-width', this._options.plots.strokeWidth)
            .style('fill', this._c)
            .style('fill-opacity', this._options.plots.opacityArea)
            .style('stroke', this._c);

        let streamNodes = series_updated.selectAll('.node')
            .data((d) => {
                return d.values;
            });

        streamNodes.exit().remove();

        streamNodes
            .attr("cx", this._x)
            .attr("cy", this._y1);

        streamNodes.enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', this._options.plots.dotRadius)
            .attr("cx", this._x)
            .attr("cy", this._y1)
            .attr('fill', this._c)
            .style('fill-opacity', 0)
            .style('stroke', this._c)
            .style('stroke-opacity', 0);

        // APPEND
        let addedSeries = series_updated
            .enter()
            .append("g")
            .attr("class", "series");

        addedSeries.append("path")
            .style('stroke', this._c)
            .style('stroke-opacity', 0)
            .style('stroke-width', this._options.plots.strokeWidth)
            .style('fill', this._c)
            .style('fill-opacity', this._options.plots.opacityArea)
            .attr("d", (d) => {
                return this._baseLine(d.values)
            })
            .attr('class', 'curve')
            .transition('append-series')
            .duration(this._options.animation.duration.update)
            .delay((d, i) => {
                return i / this._getDimension().values.length * this._options.animation.duration.update;
            })
            .attr("d", (d) => {
                return this._curve(d.values)
            });

        addedSeries.selectAll('.node')
            .data((d) => {
                return d.values;
            })
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', this._options.plots.dotRadius)
            .attr("cx", this._x)
            .attr("cy", this._y1)
            .attr('fill', this._c)
            .style('fill-opacity', 0)
            .style('stroke', this._c)
            .style('stroke-opacity', 0);

    };

    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this._svg.selectAll('.curve')
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> {
                return i / this._getDimension().values.length * this._options.animation.duration.update;
            })
            .style('stroke', this._c)
            .style('fill', this._c);

        this._svg.selectAll(".node")
            .transition()
            .duration(this._options.animation.duration.remove)
            .style('stroke', this._c);
    };

    data(_data) {
        if (check(_data) === true) {
            this._data = prepareCartesianStacked(_data, this._options);

            let _min = min(this._data.nestedData.map((d) => {
                return min(d.values.map((d) => {
                    return d.y0;
                }));
            }));

            this._getMetric().scale.domain([_min, this._data.maxY]);
        }

        return this._data;
    };

    createOptions(_userOpt) {
        return createCartesianStackedOpt(DefaultOptions, _userOpt);
    };
}

export default Stream