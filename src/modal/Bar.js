import { FieldType, mergeOptions } from 'vizart-core';

import { AbstractBasicCartesianChartWithAxes } from '../base';
import { refreshCartesian } from '../data';
import getSortDef from '../data/helper/get-sort-def';
import createCartesianOpt from '../options/createCartesianOpt';

const BarOpt = {
    chart: { type: 'bar_horizontal'}
}

class Bar extends AbstractBasicCartesianChartWithAxes {

    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._w = ()=>{
            return this._getDimension().scale.bandwidth();
        };
        this._h = (d)=> {
            return this._options.chart.innerHeight - this._y(d);
        };
        this._zero = ()=> {
            return this._getMetric().scale(0);
        }
    }

    createOptions(_userOptions) {
        return createCartesianOpt(BarOpt, _userOptions);
    }

    render(_data) {
        super.render(_data);
        this._svg.append("g").attr("class", "x axis zero")
            .attr("transform", "translate(0," + this._zero() + ")")
            .attr('opacity', 0)
            .attr('stroke-opacity', 0)
            .call(this.axes._xAxis);

        this.update();
    }

    update() {
        super.update();

        let _hasNegative = super._hasNegativeValue();

        this._svg.select("x axis zero")
            .attr("transform", "translate(0," + this._zero() + ")")
            .attr('stroke-opacity', _hasNegative ? 1 : 0);

        let bars = this._svg.selectAll('.bar').data(this._data);
        let dataJoin = bars.enter();
        let dataRemove = bars.exit();

        dataRemove
            .transition("exit-rect-transition")
            .duration(this._options.animation.duration.remove)
            .attr("y", _hasNegative ? this._y(0) : this._options.chart.innerHeight)
            .attr("height", 0)
            .remove();

        bars
            .transition("update-rect-transition")
            .duration(this._options.animation.duration.update)
            .delay((d, i) => {
                return i / this._data.length * this._options.animation.duration.update;
            })
            .attr('fill', this._c)
            .attr("x", this._x)
            .attr('width', this._w)
            .attr("y", (d)=> { return this._getMetricVal(d) > 0 ? this._y(d) : this._zero(); })
            .attr("height", (d)=> {
                return _hasNegative
                    ? Math.abs( this._y(d) - this._zero() )
                    : this._h(d);
            });


        dataJoin.append("rect")
            .attr('class', 'bar')
            .attr('fill', this._c)
            .attr('opacity', 1)
            .attr("x", this._x)
            .attr('width', this._w)
            .attr("y", _hasNegative ? this._zero(0) : this._options.chart.innerHeight)
            .attr("height", 0)
            .transition("add-rect-transition")
            .duration(this._options.animation.duration.add)
            .delay((d, i) => {
                return i / this._data.length * this._options.animation.duration.add;
            })
            .attr("y", (d)=> { return this._getMetricVal(d) > 0 ? this._y(d) : this._zero(); })
            .attr("height", (d)=> {
                return _hasNegative
                    ? Math.abs( this._y(d) - this._zero() )
                    : this._h(d);
            });

        this._bindTooltip(this._svg.selectAll('.bar'));
    };

    sort(field, direction) {
        this._options.ordering = {
            accessor: field,
            direction: direction
        };

        refreshCartesian(this._data, this._options);
        let _field = getSortDef(this._options);
        let _accessor = _field.accessor;

        switch (_field.type) {
            case FieldType.STRING:
                this._svg.selectAll('.bar')
                    .sort((a, b) => {
                        return (direction === 'asc')
                            ? a[_accessor].localeCompare(b[_accessor])
                            : b[_accessor].localeCompare(a[_accessor]);
                    });
                break;
            default:
                this._svg.selectAll('.bar')
                    .sort((a, b) => {
                        return (direction === 'asc')
                            ? a[_accessor] - b[_accessor]
                            : b[_accessor] - a[_accessor];
                    });

                break;
        }

        let transition = this._svg.transition().duration(this._options.animation.duration.update);
        let _delay = (d, i) => {
            return i / this._data.length * this._options.animation.duration.update;
        };

        transition.selectAll(".bar")
            .delay(_delay)
            .attr("x", this._x);

        this.axes.update(this._svg, this._data);
    };


    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this._svg.selectAll('.bar')
            .transition()
            .duration(this._options.animation.duration.color)
            .delay((d, i) => {
                return i / this._data.length * this._options.animation.duration.color;
            })
            .attr('fill', this._c);
    };

    _isBar() {
        return true;
    }

};


export default Bar

