import {axisBottom, axisLeft} from 'd3-axis';
import 'd3-transition';
import {format} from 'd3-format'
import isString from 'lodash-es/isString';
import isNumber from 'lodash-es/isNumber';
import isNull from 'lodash-es/isNull';

import {Globals} from 'vizart-core';

import cnTimeFormat from './cn-time-format';
import rotateXTicks from './rotete-ticks';

const isTickDiv = (data, units) => (data.length - 1) % units === 0;


const transitionTicks =(_svg, _data, opt, xAxis, yAxis)=> {
    let transition = _svg.transition().duration(opt.animation.duration.update);
    let _delay = (d, i) => {
        return i / _data.length * opt.animation.duration.update;
    };

    transition.select(".x.axis")
        .delay(_delay)
        .call(xAxis);

    transition.select(".y.axis")
        .delay(_delay)
        .call(yAxis);

    _svg.select('.x.axis').selectAll('.tick').attr('opacity', opt.xAxis.showTicks === true ? 1 : 0);
    _svg.select('.y.axis').selectAll('.tick').attr('opacity', opt.yAxis[0].showTicks === true ? 1 : 0);
    rotateXTicks(_svg, opt.xAxis.labelAngle, false);
}

const updateXAxisTickValues = (_data, opt, xAxis)=> {
    const getDimensionVal = d => d[opt.data.x.accessor];

    let maxTicks = opt.xAxis.ticks > 0 ? opt.xAxis.ticks : 31;
    if (_data.length <= maxTicks) {
        xAxis.ticks(_data.length);
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
            arr[index++] = getDimensionVal(_data[current]);
            current += increment;
        }
        arr[index] = getDimensionVal(_data[lastIndex]);
        xAxis.tickValues(arr);
    } else {
        xAxis.ticks(null);
    }
}

const updateAxis = (_svg, _data, opt, isBar = false)=>  {
    let dimension = opt.data.x;
    let metric = opt.data.y[0];
    let xScale = dimension.scale;
    let yScale = metric.scale;
    const xAxis = axisBottom();
    const yAxis = axisLeft();


    //scale ticks, bar is special because every column is distinct
    if (isBar === true) {
        updateXAxisTickValues(_data, opt);
    } else {
        if (dimension.type === Globals.DataType.DATE) {
            if (opt.xAxis.ticks > 0) { //follow user specification
                xAxis.ticks(Math.min(_data.length, opt.xAxis.ticks));
            } else if (_data.length > 31) {
                xAxis.ticks(10);
            } else {
                xAxis.ticks(_data.length);
            }
        } else if (dimension.type === Globals.DataType.NUMBER) {
            if (opt.ordering.accessor !== opt.data.y[0].accessor) {
                if (opt.xAxis.ticks > 0) { //follow user specification
                    xAxis.ticks(Math.min(_data.length, opt.xAxis.ticks));
                } else {
                    xAxis.ticks(null);
                }
            } else {
                updateXAxisTickValues(_data, opt, xAxis);
            }
        } else if (dimension.type === Globals.DataType.STRING) {
            updateXAxisTickValues(_data, opt, xAxis);
        }
    }

    yScale.nice();

    //tick formats
    if (isString(opt.yAxis[0].tickFormat)) {
        yAxis.tickFormat(format(opt.yAxis[0].tickFormat));
    } else {
        yAxis.tickFormat(null);
    }

    if (isString(opt.xAxis.tickFormat)
        && opt.xAxis.tickFormat.length > 0) {
        xAxis.tickFormat(format(opt.xAxis.tickFormat));
    } else if (dimension.type === Globals.DataType.DATE) {
        if (opt.locale === 'zh') {
            xAxis.tickFormat(cnTimeFormat);
        } else {
            xAxis.tickFormat(null);
        }
    } else {
        xAxis.tickFormat(null);
    }

    xAxis.scale(xScale);
    yAxis.scale(yScale);
    if (isNumber(opt.yAxis[0].ticks)
        && isFinite(opt.yAxis[0].ticks)
        && opt.yAxis[0].ticks > 0) {
        yAxis.ticks(metric.ticksTier);
    }

    transitionTicks(_svg, _data, opt, xAxis, yAxis);

    return {
        x: xAxis,
        y: yAxis
    }
}

const renderAxis =(_svg, _data, opt)=> {
    const {x: _xAxis, y: _yAxis } = updateAxis(_svg, _data, opt);

    const xAxis = _svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + opt.chart.innerHeight + ")")
        .call(_xAxis);

    const yAxis = _svg.append("g")
        .attr("class", "y axis")
        .call(_yAxis);

    if (opt.yAxis.length > 0 &&
        opt.yAxis[0].title.text != null) {
        _svg.append("text")
            .attr('class', 'axis-label')
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - opt.chart.margin.left + opt.yAxis[0].title.offset)
            .attr("x", 0 - (opt.chart.innerHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(opt.yAxis[0].title.text);
    }

    if (opt.xAxis.title.text != null) {
        _svg.append("text")
            .attr('class', 'axis-label')
            .attr("transform",
                "translate(" + ((opt.chart.innerWidth) / 2) + " ," +
                (opt.chart.innerHeight + opt.chart.margin.top + opt.xAxis.title.offset) + ")")
            .style("text-anchor", "middle")
            .text(opt.xAxis.title.text);
    }

    xAxis.selectAll('.tick').attr('opacity', opt.xAxis.showTicks === true ? 1 : 0);
    yAxis.selectAll('.tick').attr('opacity', opt.yAxis[0].showTicks === true ? 1 : 0);

    rotateXTicks(_svg, opt.xAxis.labelAngle, false);
}

export {
    renderAxis,
    updateAxis
};