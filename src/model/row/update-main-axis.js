import { axisBottom } from 'd3-axis';

import getMetricScale from './get-metric-scale';

const updateMainAxis = (state, filteredData) => {
  const { _options, _container } = state;
  const bottomAxis = axisBottom().scale(getMetricScale(state, filteredData));

  const domAxis = _container.select('id', 'bottom-axis').data([]);
  domAxis
    .enter()
    .append('g')
    .attr('class', 'x axis')
    .attr(
      'transform',
      'translate(' +
        _options.chart.margin.left +
        ',' +
        (_options.chart.innerHeight + _options.plots.bottomAxisOffset) +
        ')'
    );

  domAxis.call(bottomAxis);
  domAxis.select('.domain').style('opacity', 0);

  _container
    .select('.x.axis')
    .transition()
    .duration(50)
    .call(bottomAxis);
};

export default updateMainAxis;
