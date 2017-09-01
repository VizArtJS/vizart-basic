import { area } from 'd3-shape';

import { AbstractStackedCartesianChartWithAxes } from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import interpolateCurve from '../../util/curve';

import {
    StackedOptions,
    AreaMultiOptions,
    ExpandedOptions
} from './StackedArea-Options';

class StackedArea extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._curve = area()
            .x(this._x)
            .y0(this._options.chart.innerHeight)
            .y1(this._y);

        this._baseLine = area()
            .x(this._x)
            .y0(this._options.chart.innerHeight)
            .y1(this._options.chart.innerHeight);

        this._nodeY = (d) => {
            return this._options.plots.stackLayout
                ? this._y1(d)
                : this._y(d);
        }
    }

    createOptions(_userOpt) {
        return createCartesianStackedOpt(StackedOptions, _userOpt);
    };

    render(_data) {
        super.render(_data);
        this.update();
    }

    update() {
        super.update();

        if(this._options.plots.stackLayout) {
            this._curve = area().x(this._x)
                .y0(this._y0)
                .y1(this._y1);
        } else {
            this._curve = area()
                .x(this._x)
                .y0(this._options.chart.innerHeight)
                .y1(this._y);
        }

        interpolateCurve(this._options.plots.curve, [this._curve, this._baseLine]);

        let seriesUpdate = this._svg.selectAll(".series")
            .data(this._data.nested);


        // EXIT
        let exitSeries = seriesUpdate.exit();

        exitSeries.select('.curve')
            .transition("shape-fall-down")
            .duration(this._options.animation.duration.remove)
            .attr("d", (d) => { return this._baseLine(d.values); });

        exitSeries.selectAll(".node")
            .transition("shape-fall-down")
            .duration(this._options.animation.duration.remove)
            .attr('opacity', 0.2)
            .attr("cy", this._options.chart.innerHeight);

        exitSeries.remove();

        // UPDATE
        seriesUpdate.select('.curve')
            .transition()
            .duration(this._options.animation.duration.curve)
            .delay((d, i) => {
                return i / this._data.nested.length * this._options.animation.duration.curve
            })
            .attr("d", (d) => {
                return this._curve(d.values)
            })
            .style('stroke-width', this._options.plots.strokeWidth)
            .style('fill', this._c)
            .style('fill-opacity', this._options.plots.opacityArea)
            .style('stroke', this._c);


        let updatedNodes = seriesUpdate.selectAll(".node")
            .data((d) => {
                return d.values
            });

        updatedNodes.exit()
            .transition("remove-transition")
            .duration(this._options.animation.duration.remove)
            .attr('opacity', 0)
            .remove();

        updatedNodes
            .transition("update-transition")
            .duration(this._options.animation.duration.remove)
            .delay((d, i) => {
                return i * 20;
            })
            .attr('opacity', this._options.showDots === true ? 1 : 0)
            .attr("cx", this._x)
            .attr("cy", this._nodeY);

        updatedNodes.enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", 4)
            .attr("cx", this._x)
            .attr("cy", this._options.chart.innerHeight)
            .attr('fill', this._c)
            .attr('opacity', 0)
            .transition("update-transition")
            .duration(this._options.animation.duration.curve)
            .delay((d, i) => {
                return i / this._getDimension().values.length * this._options.animation.duration.curve
            })
            .attr("cy", this._nodeY)
            .attr('opacity', this._options.showDots === true ? 1 : 0);

        // APPEND
        let addedSeries = seriesUpdate
            .enter()
            .append("g")
            .attr("class", "series");

        addedSeries.append("path")
            .style('stroke', this._c)
            .style('stroke-opacity', 1)
            .style('stroke-width', this._options.plots.strokeWidth)
            .style('fill', this._c)
            .style('fill-opacity', this._options.plots.opacityArea)
            .attr("d", (d) => {
                return this._baseLine(d.values)
            })
            .attr('class', 'curve')
            .transition('append-series')
            .duration(this._options.animation.duration.curve)
            .delay((d, i) => {
                return i / this._data.nested.length * this._options.animation.duration.curve;
            })
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
            .attr("r", 4)
            .attr("cx", this._x)
            .attr("cy", this._options.chart.innerHeight)
            .attr('fill', this._c)
            .attr('opacity', 0)
            .attr("data-ctrl", (d) => {
                return "stream-node-" + this._getSeriesVal(d) + '-' + this._getDimensionVal(d);
            })
            .transition('append-series')
            .duration(this._options.animation.duration.curve)
            .delay((d, i) => {
                return i / this._getDimension().values.length * this._options.animation.duration.curve
            })
            .attr("cy", this._nodeY)
            .attr('opacity', this._options.plots.showDots === true ? 1 : 0);
    }

    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        // line
        this._svg.selectAll('.curve')
            .transition()
            .duration(this._options.animation.duration.curve)
            .delay( (d, i)=> { return i / this._data.nested.length * this._options.animation.duration.curve; })
            .style('stroke', this._c)
            .style('fill', this._c);

        // link node
        this._svg.selectAll(".area-node")
            .transition()
            .duration(this._options.animation.duration.remove)
            .attr('fill', this._c);
    };


    _updateLayout(_opt) {
        this._options.chart.type = _opt.chart.type;
        this._options.plots.stackLayout = _opt.plots.stackLayout;
        this._options.plots.stackMethod = _opt.plots.stackMethod;
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
        this._updateLayout(AreaMultiOptions);

        this.update();
    };

}

export default StackedArea;