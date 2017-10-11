import { Globals } from 'vizart-core';

import {
    scaleLinear,
    scaleTime,
    scaleBand,
    scalePoint,
} from 'd3-scale';
import{ interpolateRound } from 'd3-interpolate';
import { extent } from 'd3-array';
import uniq from 'lodash-es/uniq';
import map from 'lodash-es/map';

import {
    isYSort,
    isBar
} from '../helper';

const updateDimensionScale = (data, opt)=> {
    let dim = opt.data.x;


    if (isBar(opt)) {
        dim.values = uniq(map(data, dim.accessor));

        dim.scale = scaleBand()
            .domain(dim.values)
            .range([0, opt.chart.innerWidth])
            .paddingInner(.1)
            .paddingOuter(.6);

        return;
    }

    if (isYSort(opt)) {
        dim.values = uniq(map(data, dim.accessor));
        dim.scale = scalePoint()
            .domain(dim.values)
            .range([0, opt.chart.innerWidth]);

        return;
    }

    switch (dim.type) {
        case Globals.DataType.DATE:
            dim.values = uniq(map(data, dim.accessor));

            let _range = extent(data, d=> d[dim.accessor]);

            dim.min = _range[0];
            dim.max = _range[1];

            dim.scale = scaleTime()
                .domain((opt.ordering.direction === 'asc') ? _range : _range.reverse())
                .range([0, opt.chart.innerWidth])
                .interpolate(interpolateRound);

            break;

        case Globals.DataType.NUMBER:
            // todo number format
            dim.values = uniq(map(data, dim.accessor));

            let _rangeNm = extent(data, d=> d[dim.accessor]);

            dim.min = _rangeNm[0];
            dim.max = _rangeNm[1];

            dim.scale = scaleLinear()
                .domain((opt.ordering.direction === 'asc') ? _rangeNm : _rangeNm.reverse())
                .range([0, opt.chart.innerWidth]);

            break;
        case Globals.DataType.STRING:
            dim.values = uniq(map(data, dim.accessor));
            dim.scale = scalePoint()
                .domain(dim.values)
                .range([0, opt.chart.innerWidth]);

            break;

        default:
            break;
    }
};

export default updateDimensionScale;