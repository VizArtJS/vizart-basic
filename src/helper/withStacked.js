import { getMetric } from './withCartesian';

const getSeries = state => state._options.data.s;
const s = state => d => d[getSeries(state).accessor];
const y1 = state => d => getMetric(state).scale(d.y1);
const y0 = state => d => getMetric(state).scale(d.y0);
const c = state => d =>
  d.hasOwnProperty('key') ? state._color(d.key) : state._color(s(state)(d));

export { getSeries, s, y0, y1, c };
