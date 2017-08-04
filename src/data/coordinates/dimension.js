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

import { isYSort } from '../helper';

const dimensionScale = (_data, _options)=> {
    let _dim = _options.data.x;

    if (_options.chart.type === 'bar_horizontal'
        || _options.chart.type === 'bar_grouped'
        || _options.chart.type === 'bar_stacked'
        || _options.chart.type === 'bar_expanded') {
        _dim.values = uniq(map(_data, _dim.accessor));

        _dim.scale = scaleBand()
            .domain(_dim.values)
            .range([0, _options.chart.innerWidth])
            .paddingInner(.1)
            .paddingOuter(.6);

        return;
    }

    if (isYSort(_options)) {
        _dim.values = uniq(map(_data, _dim.accessor));
        _dim.scale = scalePoint()
            .domain(_dim.values)
            .range([0, _options.chart.innerWidth]);

        return;
    }

    switch (_dim.type) {
        case Globals.DataType.DATE:
            _dim.values = uniq(map(_data, _dim.accessor));

            let _range = extent(_data, function (d) { return d[_dim.accessor];  });

            _dim.min = _range[0];
            _dim.max = _range[1];

            _dim.scale = scaleTime()
                .domain((_options.ordering.direction === 'asc') ? _range : _range.reverse())
                .range([0, _options.chart.innerWidth])
                .interpolate(interpolateRound);

            break;

        case Globals.DataType.NUMBER:
            // todo number format
            _dim.values = uniq(map(_data, _dim.accessor));

            let _rangeNm = extent(_data, function (d) { return d[_dim.accessor];  });

            _dim.min = _rangeNm[0];
            _dim.max = _rangeNm[1];

            _dim.scale = scaleLinear()
                .domain((_options.ordering.direction === 'asc') ? _rangeNm : _rangeNm.reverse())
                .range([0, _options.chart.innerWidth]);

            break;
        case Globals.DataType.STRING:
            _dim.values = uniq(map(_data, _dim.accessor));
            _dim.scale = scalePoint()
                .domain(_dim.values)
                .range([0, _options.chart.innerWidth]);

            break;

        default:
            break;
    }
};

export default dimensionScale;