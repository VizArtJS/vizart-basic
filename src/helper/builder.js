import { apiRenderCanvas, apiUpdate, canvasLayer } from 'vizart-core';
import { renderAxis, updateAxis } from '../axis';
import apiSort from './api-sort';

import { stackedComposer, standardComposer } from './composers';

const apiRender = (state, animate, hasAxis, stacked) => ({
  render(data) {
    apiRenderCanvas(state).render(data);
    if (hasAxis === true) {
      renderAxis(state, stacked);
    }
    animate(state);
  },
});

const apiUpdateChart = (state, animate, hasAxis, stacked) => ({
  update() {
    apiUpdate(state).update();
    if (hasAxis === true) {
      updateAxis(state, stacked);
    }
    animate(state);
  },
});

const apiColor = state => ({
  color(colorOpt) {
    state._options.color = colorOpt;
    state.update();
  },
});

const addApi = (state, apis) => {
  return apis.reduce((acc, cur) => {
    acc = Object.assign(acc, cur(acc));
    return acc;
  }, state);
};

const build = builderConfig => (ChartOpt, animate, apis = []) => (id, opt) => {
  const { hasAxis = true, stacked = false } = builderConfig;
  const compose = stacked === true ? stackedComposer : standardComposer;

  const baseChart = canvasLayer(id, opt, compose(ChartOpt));

  const chart = Object.assign(
    baseChart,
    apiRender(baseChart, animate, hasAxis, stacked),
    apiUpdateChart(baseChart, animate, hasAxis, stacked)
  );

  return addApi(chart, [apiColor, apiSort, ...apis]);
};

const cartesian = build({ hasAxis: true, stacked: false });
const polar = build({ hasAxis: false, stacked: false });
const stacked = build({ hasAxis: true, stacked: true });
const polarStacked = build({ hasAxis: false, stacked: true });

export default build;

export { cartesian, polar, stacked, polarStacked };
