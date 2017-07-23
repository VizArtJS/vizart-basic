import { axisBottom, axisLeft } from 'd3-axis';
import 'd3-transition';
import { format } from 'd3-format'
import isString from 'lodash-es/isString';
import isNumber from 'lodash-es/isNumber';

import {
    rotateXTicks,
    cnTimeFormat,
    FieldType
} from 'vizart-core';


const isTickDiv = function(_data, _units) {
    return (_data.length - 1) % _units == 0;
}

class Axis {
    constructor(_options) {
        this._options = _options;

        this._getMetric = ()=> { return this._options.data.y[0]; };
        this._getDimension = ()=> { return this._options.data.x; };
        this._getDimensionVal = (d)=> {
            return d[this._getDimension().accessor];
        };


        this._xAxis;
        this._yAxis;
    }

    updateTickValues(_data) {
        let _options = this._options;

        let maxTicks = _options.xAxis.ticks > 0 ? _options.xAxis.ticks : 31;
        if (_data.length <= maxTicks) {
            this._xAxis.ticks(_data.length);
            return;
        }

        let units = 10;
        if (maxTicks <= 10) {
            units = maxTicks;
            while (units > 1) { //minimum 1
                if (isTickDiv(_data, units)) {
                    break;
                }
                --units;
            }
        } else {
            if (isTickDiv(5)) {
                units = isTickDiv(_data, 10) ? 10 : 5;
            } else if (isTickDiv(_data, 7)) {
                units = 7;
            } else if (isTickDiv(_data, 8)) {
                units = 8;
            } else if (isTickDiv(_data, 9)) {
                units = 9;
            } else if (isTickDiv(_data, 11)) {
                units = 11;
            } else if (maxTicks >= 12 && isTickDiv(_data, 12)) {
                units = 12;
            } else if (maxTicks >= 13 && isTickDiv(_data, 13)) {
                units = 13;
            } else if (isTickDiv(_data, 6)) {
                units = 6;
            }
            //use default here
        }

        if (units > 1) {
            let current = 0;
            let index = 0;
            let lastIndex = _data.length - 1;
            let increment = Math.floor((_data.length - 1) / units);
            let arr = new Array(units + (isTickDiv(_data, units) ? 1 : 2));

            while (current < lastIndex) {
                arr[index++] = this._getDimensionVal(_data[current]);
                current += increment;
            }
            arr[index] = this._getDimensionVal(_data[lastIndex]);
            this._xAxis.tickValues(arr);
        } else {
            this._xAxis.ticks(null);
        }
    }

    render(_svg, _data) {
        this._xAxis = axisBottom();
        this._yAxis = axisLeft();

        this.update(_svg, _data);

        _svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this._options.chart.innerHeight + ")")
            .call(this._xAxis);

        _svg.append("g")
            .attr("class", "y axis")
            .call(this._yAxis);

        rotateXTicks(_svg, this._options.xAxis.labelAngle, false);
    }

    update(_svg, _data, isBar = false) {
        let dimension = this._getDimension();
        let metric = this._getMetric();
        let xScale = dimension.scale;
        let yScale = metric.scale;
        this._xAxis = axisBottom();
        this._yAxis = axisLeft();


        //scale ticks, bar is special because every column is distinct
        if (isBar === true) {
            this.updateTickValues(_data);
        } else {
            if (dimension.type === FieldType.DATE) {
                if (this._options.xAxis.ticks > 0) { //follow user specification
                    this._xAxis.ticks (Math.min(_data.length, this._options.xAxis.ticks));
                } else if (_data.length > 31) {
                    this._xAxis.ticks (10);
                } else {
                    this._xAxis.ticks (_data.length);
                }
            } else if (dimension.type === FieldType.NUMBER) {
                if (this._options.ordering.accessor !== this._options.data.y[0].accessor) {
                    if (this._options.xAxis.ticks > 0) { //follow user specification
                        this._xAxis.ticks (Math.min(_data.length, this._options.xAxis.ticks));
                    } else {
                        this._xAxis.ticks (null);
                    }
                } else {
                    this.updateTickValues(_data);
                }
            } else if (dimension.type === FieldType.STRING) {
                this.updateTickValues(_data);
            }
        }

        yScale.nice();

        //tick formats
        if (isString(this._options.yAxis[0].tickFormat)) {
            this._yAxis.tickFormat(format(this._options.yAxis[0].tickFormat));
        } else {
            this._yAxis.tickFormat(null);
        }

        if (isString(this._options.xAxis.tickFormat)
            && this._options.xAxis.tickFormat.length > 0) {
            this._xAxis.tickFormat(format(this._options.xAxis.tickFormat));
        } else if (dimension.type === FieldType.DATE) {
            if (this._options.locale === 'zh') {
                this._xAxis.tickFormat(cnTimeFormat);
            } else {
                this._xAxis.tickFormat(null);
            }
        } else {
            this._xAxis.tickFormat(null);
        }

        this._xAxis.scale(xScale);
        this._yAxis.scale(yScale);
        if (isNumber(this._options.yAxis[0].ticks)
            && isFinite(this._options.yAxis[0].ticks)
            && this._options.yAxis[0].ticks > 0) {
            this._yAxis.ticks(metric.ticksTier);
        }

        this.transition(_svg, _data);
    }

    transition(_svg, _data) {
        let transition = _svg.transition().duration(this._options.animation.duration.update);
        let _delay = (d, i) => { return i / _data.length * this._options.animation.duration.update; };

        transition.select(".x.axis")
            .delay(_delay)
            .call(this._xAxis);

        transition.select(".y.axis")
            .delay(_delay)
            .call(this._yAxis);

        rotateXTicks(_svg, this._options.xAxis.labelAngle, false);
    }
}

export default Axis;