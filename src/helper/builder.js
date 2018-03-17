import {
  apiRenderCanvas,
  apiUpdate,
  canvas,
} from 'vizart-core';
import { renderAxis, updateAxis } from '../axis/index';

import {
    stackedComposer,
    standardComposer
} from './composers';


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

const apiColor = (state, animate, hasAxis, stacked) => ({
  color(colorOpt) {
    state._options.color = colorOpt;
    apiUpdate(state).update();
    if (hasAxis === true) {
      updateAxis(state, stacked);
    }
    animate(state);
  },
});

const build = builderConfig => (ChartOpt, animate) => (id, opt) => {
  const { hasAxis = true, stacked = false} = builderConfig;
  const compose = stacked === true ? stackedComposer : standardComposer;

  const baseChart = canvas(id, opt, compose(ChartOpt));

  return Object.assign(
    baseChart,
    apiRender(baseChart, animate, hasAxis, stacked),
    apiUpdateChart(baseChart, animate, hasAxis, stacked),
    apiColor(baseChart, animate, hasAxis, stacked)
  );
};

const cartesian = build({ hasAxis: true, stacked: false});
const polar = build({ hasAxis: false, stacked: false});
const stacked = build({ hasAxis: true, stacked: true});
const polarStacked = build({ hasAxis: false, stacked: true});

export default build;

export {
    cartesian,
    polar,
    stacked,
    polarStacked,
}
