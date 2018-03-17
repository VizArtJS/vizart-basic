import { select } from 'd3-selection';
import { uuid } from 'vizart-core';

const renderTooltip = state => {
  return select(state._containerId)
    .append('div')
    .attr('id', 'tooltip-' + uuid())
    .attr('class', 'vizart-tooltip')
    .style('opacity', 0);
};

export default renderTooltip;
