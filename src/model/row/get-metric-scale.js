import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import tickRange from '../../data/update-scale/ticks';
import { getMetricVal } from '../../helper/withCartesian';

const getMetricScale = (state, data) => {
  const { _options } = state;
  const _getMetricVal = getMetricVal(state);

  const yExtent = extent(data, _getMetricVal);

  let tickedRange;
  if (yExtent[1] <= 0 || yExtent[0] >= 0) {
    // only negative or only positive
    tickedRange = tickRange(
      yExtent,
      _options.yAxis[0].ticks,
      _options.yAxis[0].tier
    );
  } else {
    // both positive and negative
    const boundary = Math.max(Math.abs(yExtent[0]), yExtent[1]);
    tickedRange = tickRange(
      [-boundary, boundary],
      _options.yAxis[0].ticks,
      _options.yAxis[0].tier
    );
  }

  const mainWidth = _options.chart.innerWidth - _options.plots.miniBarWidth;

  return scaleLinear()
    .domain([tickedRange[0], tickedRange[1]])
    .range([0, mainWidth]);
};

export default getMetricScale;
