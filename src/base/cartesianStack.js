import cartesian, { getMetric } from './cartesian';

const getSeries = state => state._options.data.s;
const s = state => d => d[getSeries(state).accessor];
const y1 = state => d => getMetric(state).scale(d.y1);
const y0 = state => d => getMetric(state).scale(d.y0);
const c = state => d =>
  d.hasOwnProperty('key') ? state._color(d.key) : state._color(s(state)(d));

const cartesianStacked = state =>
  Object.assign({}, cartesian(state), {
    _getSeries: getSeries(state),
    _s: s(state),
    _y1: y1(state),
    _y0: y0(state),
    _c: c(state),
  });

export default cartesianStacked;
