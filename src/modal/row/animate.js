import drawMainBars from './draw-main-bars';
import updateMainAxis from './update-main-axis';
import drawMiniSvg from './draw-mini-svg';
import { getDimension, x } from '../../helper/withCartesian';

const forceMetricDesc = state => {
  state.ordering = {
    accessor: state._options.data.y[0].accessor,
    direction: 'desc',
  };
};

const animate = state => {
  console.log(state);
  forceMetricDesc(state);

  const { _options, _data } = state;
  getDimension(state).scale.range([0, _options.chart.innerHeight]);

  const data = _data.filter(
    d => x(state)(d) < _options.plots.initialBrushHeight
  );

  if (_options.plots.enableMiniBar === true) {
    drawMiniSvg(state);
    drawMainBars(state, data);
  } else {
    drawMainBars(state, _data);
    updateMainAxis(state, _data);
  }
};

export default animate;
