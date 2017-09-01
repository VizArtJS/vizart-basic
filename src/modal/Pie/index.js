import { check, Globals } from 'vizart-core';
import { pie, arc } from 'd3-shape';
import { format } from 'd3-format';
import { sum } from 'd3-array';
import { interpolate } from 'd3-interpolate';
import { transition } from 'd3-transition';

import createCartesianOpt from '../../options/createCartesianOpt';
import { AbstractBasicCartesianChart } from '../../base';
import TooltipTpl from '../../base/tooltip-tpl';

import {
    midAngle,
    getLinePosition,
    getLabelPosition
} from './Pie-Angle';

import {
    mergeWithFirstEqualZero,
    limitSliceValues
} from './helper';


const percentFormat = format(".00%");

const DefaultOptions = {
    chart: {
        type: 'pie'
    },
    animation: {
        duration: {
            slice: 1000,
        }
    },
    plots: {
        othersTitle: 'Others',
        isDonut: false,
        innerRadiusRatio: 0.4
    },
    slice: {
        labelPosition: 'auto',
        labelMinPercentage: 0.01
    }
};

class Pie extends AbstractBasicCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this.sliceGroup;
        this.labelGroup;
        this.lineGroup;
        this.linkGroup;

        this.total = 0;
        this.consecutiveSmalls = false;
        this._limitSliceValues = limitSliceValues.bind(this);
        this._mergeWithFirstEqualZero = mergeWithFirstEqualZero.bind(this);

        this._key = d=> d.data[this._getDimension().accessor];
        //override
        this._c =(d, i) => {
            if (d.color) {
                return d.color;
            }

            switch (this._options.color.type){
                case Globals.ColorType.CATEGORICAL:
                    return this._color(this._getDimensionVal(d.data));
                case Globals.ColorType.GRADIENT:
                case Globals.ColorType.DISTINCT:
                    return this._color(this._getMetricVal(d.data));
                default:
                    return this._color(this._getMetricVal(d.data));
            }
        }
        this._p = (d)=> {
            let pct = this._getMetricVal(d.data) / this.total;
            return pct < this.minPct && this.consecutiveSmalls
                ? ''
                : this._getDimensionVal(d.data) + ': ' + percentFormat(pct);
        };
    }

    render(_data) {
        super.render(_data);

        this._svg.attr("transform", "translate("
            + (this._options.chart.innerWidth / 2 + this._options.chart.margin.left)
            + ","
            + (this._options.chart.innerHeight / 2 + this._options.chart.margin.top)
            + ")");

        this.sliceGroup = this._svg.append("g").attr("class", "slices");
        this.labelGroup = this._svg.append("g").attr("class", "labels");
        this.lineGroup = this._svg.append("g").attr("class", "lines");
        this.linkGroup = this._svg.append("g").attr('class', 'link-group');

        this.radius = Math.min(this._options.chart.innerWidth, this._options.chart.innerHeight) / 2;
        this.minPct = this._options.slice.labelMinPercentage > 0
            ? this._options.slice.labelMinPercentage
            : 0.01;

        this.update();
    }

    update() {
        let that = this;

        super.update();

        let _arc = arc()
            .outerRadius(this.radius * 0.8)
            .innerRadius(() => {
                return this._options.plots.isDonut ? this.radius * this._options.plots.innerRadiusRatio : 0;
            });

        this.outerArc = arc()
            .innerRadius(this.radius * 0.9)
            .outerRadius(this.radius * 0.9);

        let _pie = pie()
            .sort(null)
            .value(this._getMetricVal);

        let data1 = this._limitSliceValues(this.total);
        let data0 = this._svg.select('.slices')
            .selectAll("path.slice")
            .data().map((d) => { return d.data });
        if (data0.length == 0) data0 = data1;
        let was = this._mergeWithFirstEqualZero(data1, data0);
        let is = this._mergeWithFirstEqualZero(data0, data1);

        /* ------- SLICE ARCS -------*/

        let slice = this.sliceGroup.selectAll("path.slice")
            .data(_pie(was), this._key);

        slice.enter()
            .append("path")
            .attr("class", "slice")
            .each(function(d) { this._current = d; })
            .style("fill", this._c)
            .style('stroke-width', 2);

        slice = this.sliceGroup.selectAll("path.slice")
            .data(_pie(is), this._key);

        slice
            .transition().duration(this._options.animation.duration.slice)
            .attrTween("d", function (d) {
                var _interpolate = interpolate(this._current, d);
                var _this = this;
                return function (t) {
                    _this._current = _interpolate(t);
                    return _arc(_this._current);
                };
            });

        slice = this.sliceGroup.selectAll("path.slice")
            .data(_pie(data1), this._key);

        slice
            .exit().transition().delay(this._options.animation.duration.slice).duration(0)
            .remove();

        /* ------- TEXT LABELS -------*/

        let text = this.labelGroup.selectAll("text")
            .data(_pie(was), this._key);

        text.enter()
            .append("text")
            .attr('dx', "0px")
            .attr("dy", "0px")
            .style('font-size', '12px')
            .style("opacity", 0)
            .text(this._p)
            .each(function (d) {
                this._current = d;
            });

        text = this.labelGroup.selectAll("text")
            .data(_pie(is), this._key);

        text.transition().duration(this._options.animation.duration.slice)
            .style("opacity", (d)=> {
                return this._getMetricVal(d.data) == 0 ? 0 : 1;
            })
            .attrTween("transform", function (d) {
                let _interpolate = interpolate(this._current, d);
                let _this = this;
                return function (t) {
                    let d2 = _interpolate(t);
                    _this._current = d2;

                    let pos = getLabelPosition(that.outerArc, d2);

                    return "translate(" + pos + ")";
                };
            })
            .styleTween("text-anchor", function (d) {
                let _interpolate = interpolate(this._current, d);
                return function (t) {
                    let d2 = _interpolate(t);
                    return midAngle(d2) < Math.PI ? "start" : "end";
                };
            })
            .text(this._p);

        text = this.labelGroup.selectAll("text")
            .data(_pie(data1), this._key);

        text
            .exit().transition().delay(this._options.animation.duration.slice)
            .remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/

        let polyline = this.lineGroup.selectAll("polyline")
            .data(_pie(was), this._key);

        polyline.enter()
            .append("polyline")
            .style("opacity", 0)
            .style('stroke', this._c)
            .style('stroke-width', 2)
            .style('fill', 'none')
            .each(function (d) {
                this._current = d;
            });

        polyline = this.lineGroup.selectAll("polyline")
            .data(_pie(is), this._key);

        polyline.transition().duration(this._options.animation.duration.slice)
            .attr('fill', this._c)
            .style("opacity",  (d)=> {
                return this._getMetricVal(d.data) == 0 ? 0 : .5;
            })
            .attrTween("points", function (d) {
                this._current = this._current;
                let _interpolate = interpolate(this._current, d);
                let _this = this;

                return function (t) {
                    let d2 = _interpolate(t);
                    _this._current = d2;

                    let pct = that._getMetricVal(d.data) / that.total;

                    if (pct < that.minPct && that.consecutiveSmalls) {
                        return [];
                    } else {
                        let c = _arc.centroid(d2);
                        let x = c[0];
                        let y = c[1];

                        let starting = [];
                        // pythagorean theorem for hypotenuse
                        let h = Math.sqrt(x * x + y * y);

                        starting[0] = x / h * that.radius * 0.8;
                        starting[1] = y / h * that.radius * 0.8;

                        let pos = getLinePosition(that.outerArc, d2);

                        return [starting, pos];
                    }
                };
            });

        polyline = this.lineGroup.selectAll("polyline")
            .data(_pie(data1), this._key);

        polyline
            .exit().transition().delay(this._options.animation.duration.slice)
            .remove();


        /* ------- Link Nodes -------*/

        let linkNode = this.linkGroup.selectAll(".link-node")
            .data(_pie(was), this._key);

        linkNode.enter()
            .append("circle")
            .attr('class', 'link-node')
            .attr("r", 6)
            .style("opacity", 0)
            .attr('fill', this._c)
            .attr('stroke', 'white')
            .attr('stroke-width', '2px')
            .each(function (d) {
                this._current = d;
            });

        linkNode = this.linkGroup.selectAll(".link-node")
            .data(_pie(is), this._key);

        linkNode.transition().duration(this._options.animation.duration.slice)
            .style("opacity", (d)=> {
                return this._getMetricVal(d.data) == 0 ? 0 : 1;
            })
            .attrTween("transform", function (d) {
                //let c = arc.centroid(d),
                //    x = c[0],
                //    y = c[1],
                //// pythagorean theorem for hypotenuse
                //    h = Math.sqrt(x*x + y*y);
                //return "translate(" + (x/h * radius) +  ',' +
                //    (y/h * radius) +  ")";

                this._current = this._current;
                let _interpolate = interpolate(this._current, d);
                let _this = this;
                return function (t) {
                    let d2 = _interpolate(t);
                    _this._current = d2;

                    let c = that.outerArc.centroid(d2);
                    let x = c[0];
                    let y = c[1];
                    // pythagorean theorem for hypotenuse
                    let h = Math.sqrt(x * x + y * y);
                    return "translate(" + (x / h * that.radius * 0.8) + ',' +
                        (y / h * that.radius * 0.8) + ")";
                    //return "translate("+  +")";
                };
            });


        linkNode = this.linkGroup.selectAll(".link-node")
            .data(_pie(data1), this._key);

        linkNode
            .exit().transition().delay(this._options.animation.duration.slice)
            .remove();

        this._bindTooltip(this.sliceGroup.selectAll("path.slice"), true);
    }


    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        let maxTicks = this._options.xAxis.ticks > 0 ? this._options.xAxis.ticks : 31;
        let maxSlices = this._data.length > 0 && this._data.length < maxTicks
            ? this._data.length
            : maxTicks;

        let _trans = transition()
            .duration(this._options.animation.duration.color)
            .delay((d, i) => {
                return i / maxSlices * this._options.animation.duration.color;
            });

        this.sliceGroup.selectAll("path.slice")
            .transition(_trans)
            .style("fill", this._c);


        this.linkGroup.selectAll(".link-node")
            .transition(_trans)
            .style("fill", this._c);

        this.lineGroup.selectAll("polyline")
            .transition(_trans)
            .style("stroke", this._c);
    };

    donut(isDonut = false) {
        if (isDonut === false) {
            this._options.plots.isDonut = false;
        } else {
            this._options.plots.isDonut = true;
            this._options.plots.innerRadiusRatio = 0.4;
        }

        this.update();
    }

    data(_data) {
        if (check(_data) === true) {
            this.total = sum(_data, (d) => { return this._getMetricVal(d); });
        }

        super.data(_data);
    }

    createOptions(_userOpt) {
        return createCartesianOpt(DefaultOptions, _userOpt);
    };

    _getTooltipHTML(d) {
        return TooltipTpl
            .replace("{{header}}", this._getDimensionVal(d.data))
            .replace("{{name}}", this._getMetric().name)
            .replace("{{value}}", this._getMetricVal(d.data))
            .replace("{{borderStroke}}", this._c(d));
    }

    _provideColor() {
        // pie's other slice may contain value out of range
        return super._provideColor().clamp(true);
    }
}


export default Pie