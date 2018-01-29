import { scaleLinear } from 'd3-scale';

import { extent, max, min } from 'd3-array';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isNumber from 'lodash-es/isNumber';

import tickRange from './ticks';

const isValid = d => !isUndefined(d) && !isNull(d) && isNumber(d);

const updateMetricScale = (data, opt) => {
  for (const [i, x] of opt.yAxis.entries()) {
    const yList = opt.data.y.filter(d => d.yAxis === i);
    const rangeList = yList.map(d => extent(data, datum => datum[d.accessor]));

    let universalMin = min(rangeList, d => d[0]);
    let universalMax = max(rangeList, d => d[1]);

    if (isValid(x.min)) {
      if (x.min > universalMin) {
        console.error('invalid yAxis min detected, auto scale will be used');
      } else {
        universalMin = x.min;
      }
    }

    if (isValid(x.max)) {
      if (x.max < universalMax) {
        console.error('invalid yAxis max detected, auto scale will be used');
      } else {
        universalMax = x.max;
      }
    }

    x.min = universalMin;
    x.max = universalMax;
  }

  for (let m of opt.data.y) {
    m.yAxis = m.yAxis || 0;

    if (opt.yAxis.length < m.yAxis + 1) {
      throw new Error('invalid yAxis definition for data y: ' + m.accessor);
    }

    const axisDef = opt.yAxis[m.yAxis];
    const range = [axisDef.min, axisDef.max];

    let _tickedRange = tickRange(
      range,
      opt.yAxis[m.yAxis].ticks,
      opt.yAxis[m.yAxis].tier
    );

    m.ticksMin = _tickedRange[0];
    m.ticksMax = _tickedRange[1];
    m.ticksTier = _tickedRange[2];

    m.min = range[0];
    m.max = range[1];

    m.scale = scaleLinear()
      .domain([m.ticksMin, m.ticksMax])
      .range([opt.chart.innerHeight, 0]);
  }
};

export default updateMetricScale;
