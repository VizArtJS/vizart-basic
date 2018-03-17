import {
  apiRenderCanvas,
  apiUpdate,
  canvas,
  categoricalColor,
} from '../../../vizart-core/dist/vizart-core';
import createCartesianStackedOpt from '../options/createCartesianStackedOpt';
import { processStackedData } from '../data/index';
import { renderAxis, updateAxis } from '../axis/index';

const colorBySeries = (colorOpt, data, opt) => {
  const distinct = data && data.nested ? data.nested.length : 0;
  return categoricalColor(opt.color.scheme, distinct);
};

const apiRender = (state, animate, hasAxis) => ({
  render(data) {
    apiRenderCanvas(state).render(data);
    if (hasAxis === true) {
      renderAxis(state, true);
    }
    animate(state);
  },
});

const apiUpdateChart = (state, animate, hasAxis) => ({
  update() {
    apiUpdate(state).update();
    if (hasAxis === true) {
      updateAxis(state, true);
    }
    animate(state);
  },
});

const apiColor = (state, animate, hasAxis) => ({
  color(colorOpt) {
    state._options.color = colorOpt;
    apiUpdate(state).update();
    if (hasAxis === true) {
      updateAxis(state, true);
    }
    animate(state);
  },
});

const build = (ChartOpt, animate, hasAxis = true) => (id, opt) => {
  const composers = {
    opt: opt => createCartesianStackedOpt(ChartOpt, opt),
    data: processStackedData,
    color: colorBySeries,
  };

  const baseChart = canvas(id, opt, composers);

  return Object.assign(
    baseChart,
    apiRender(baseChart, animate, hasAxis),
    apiUpdateChart(baseChart, animate, hasAxis),
    apiColor(baseChart, animate, hasAxis)
  );
};

export default build;
