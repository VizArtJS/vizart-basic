import {
    axisBottom,
    axisLeft
} from 'd3-axis';
import { format } from 'd3-format';
import cnTimeFormat from './cn-time-format';
import isNumber from 'lodash-es/isNumber';
import isString from 'lodash-es/isString';
import isFinite from 'lodash-es/isFinite';

import updateXAxisTicks from './update-x-ticks'
import transitionTicks from './transition';

import { Globals } from 'vizart-core';

const updateAxis = (_svg, _data, opt, isBar = false)=>  {
    let dimension = opt.data.x;
    let metric = opt.data.y[0];
    let xScale = dimension.scale;
    let yScale = metric.scale;
    const xAxis = axisBottom();
    const yAxis = axisLeft();

    //scale ticks, bar is special because every column is distinct
    if (isBar === true) {
        updateXAxisTicks(_data, opt);
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
                updateXAxisTicks(_data, opt, xAxis);
            }
        } else if (dimension.type === Globals.DataType.STRING) {
            updateXAxisTicks(_data, opt, xAxis);
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

export default updateAxis;