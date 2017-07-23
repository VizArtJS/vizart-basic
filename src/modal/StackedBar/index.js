import { AbstractStackedCartesianChartWithAxes } from '../../base';

import {
    GroupedOptions,
    StackedOptions,
    ExpandedOptions
} from './StackedBar-Options';

import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';

class StackedBar extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._band = () => {
            return this._getDimension().scale.bandwidth();
        }

        this._x = (d) => {
            let xPos = this._getDimension().scale(this._getDimensionVal(d));

            return (this._options.plots.stackLayout === true)
                ? xPos
                : xPos
                + this._band() / this._data.nestedData.length
                * this._options.data.s.values.indexOf(this._getSeriesVal(d));
        };

        this._y = (d) => {
            return (this._options.plots.stackLayout === true)
                ? this._getMetric().scale(d.y)
                : this._getMetric().scale(this._getMetricVal(d));
        }

        this._w = (d, i) => {
            return (this._options.plots.stackLayout === true)
                ? this._band()
                : this._band() / this._data.nestedData.length;
        }

        this._h = (d) => {
            return (this._options.plots.stackLayout === true)
                ? this._getMetric().scale(d.y0) - this._getMetric().scale(d.y)
                : this._options.chart.innerHeight - this._getMetric().scale(this._getMetricVal(d));
        }
    }

    render(_data) {
        super.render(_data);
        this.update();
    }

    update() {
        super.update();

        let seriesUpdate = this._svg.selectAll(".series")
            .data(this._data.nestedData);


        // EXIT
        let exitSeries = seriesUpdate.exit();

        exitSeries.selectAll('.bar')
            .transition("ease-bar")
            .duration(this._options.animation.duration.remove)
            .attr("y", this._options.chart.innerHeight)
            .attr("height", 0);

        setTimeout(function () {
            exitSeries.remove();
        }, this._options.animation.duration.remove);

        // UPDATE

        let bars_update = seriesUpdate.selectAll('.bar')
            .data((d) => {
                return d.values;
            });

        if (this._options.plots.stackLayout === true) {
            bars_update.transition()
                .duration(this._options.animation.duration.layout)
                .delay((d, i) => {
                    return i * 10;
                })
                .attr("x", this._x)
                .attr("width", this._w)
                .transition()
                .attr("y", this._y)
                .attr("height", this._h);
        } else {
            bars_update.transition()
                .duration(this._options.animation.duration.layout)
                .delay((d, i) => {
                    return i * 10;
                })
                .attr("y", this._y)
                .attr("height", this._h)
                .transition()
                .attr("x", this._x)
                .attr("width", this._w);
        }

        bars_update.exit()
            .transition("remove-rect-transition")
            .duration(this._options.animation.duration.add)
            .delay((d, i) => {
                return i * 100;
            })
            .attr("height", 0)
            .attr("y", this._options.chart.innerHeight)
            .remove();


        bars_update.enter()
            .append("rect")
            .attr('class', 'bar')
            .attr('opacity', 1)
            .attr("x", this._x)
            .attr("width", this._w)
            .attr("y", this._options.chart.innerHeight)
            .attr("height", 0)
            .transition("add-rect-transition")
            .duration(this._options.animation.duration.add)
            .delay((d, i) => {
                return i / this._getDimension().values.length * this._options.animation.duration.add;
            })
            .attr("y", this._y)
            .attr("height", this._h);


        // append
        let appendedSeries = seriesUpdate.enter()
            .append("g")
            .attr("class", "series")
            .style("fill", this._c);


        appendedSeries.selectAll(".bar")
            .data((d) => {
                return d.values;
            })
            .enter()
            .append("rect")
            .attr('class', 'bar')
            .attr('opacity', 1)
            .attr("x", this._x)
            .attr('width', this._w)
            .attr("y", this._options.chart.innerHeight)
            .attr("height", 0)
            .transition("add-rect-transition")
            .duration(this._options.animation.duration.add)
            .delay((d, i) => {
                return i / this._getDimension().values.length * this._options.animation.duration.add;
            })
            .attr("y", this._y)
            .attr("height", this._h);
    }


    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this._svg.selectAll(".series")
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> {
                return i / this._options.animation.duration.update * this._data.nestedData.length
            })
            .style("fill", this._c);
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
        this._updateLayout(GroupedOptions);
        this.update();
    };

    createOptions(_userOpt) {
        return createCartesianStackedOpt(GroupedOptions, _userOpt);
    };
}

export default StackedBar;