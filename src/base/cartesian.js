import { Globals, uuid, AbstractCanvasChart, compose } from 'vizart-core';
import './tooltip.css';
import { select } from 'd3-selection';
import tooltipMarkup from './tooltip';

const renderTooltip = state => {
  return select(state._containerId)
    .append('div')
    .attr('id', 'tooltip-' + uuid())
    .attr('class', 'vizart-tooltip')
    .style('opacity', 0);
};

const getDimension = state => state._options.data.x;
const getMetric = state => state._options.data.y[0];
const getDimensionVal = state => d => d[getDimension(state).accessor];
const getMetricVal = state => d => d[getMetric(state).accessor];
const x = state => d => getDimension(state).scale(getDimensionVal(state)(d));
const y = state => d => getMetric(state).scale(getMetricVal(state)(d));
const c = state => d => {
  if (d.color !== null && d.color !== undefined) {
    return d.color;
  }

  switch (state._options.color.type) {
    case Globals.ColorType.CATEGORICAL:
      return state._color(getDimensionVal(state)(d));
    case Globals.ColorType.GRADIENT:
    case Globals.ColorType.DISTINCT:
      return state._color(getMetricVal(state)(d));
    default:
      return state._color(getMetricVal(state)(d));
  }
};

const cartesian = state =>
  Object.assign({}, state, {
    _metric: getMetric(state),
    _dimension: getDimension(state),
    _getDimensionVal: getDimensionVal(state),
    _getMetricVal: getMetricVal(state),
    _tooltip: renderTooltip(state),
    _x: x(state),
    _y: y(state),
    _c: c(state),
  });

export default cartesian;

export { getMetric };
