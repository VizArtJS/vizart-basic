import { Globals } from 'vizart-core';

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

export { getMetric, getMetricVal, getDimension, getDimensionVal, x, y, c };
