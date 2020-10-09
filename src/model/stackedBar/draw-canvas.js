import { getTransparentColor } from 'vizart-core';

import drawMetricOntTop from './draw-metric-on-top';

const drawCanvas = (context, state, opt) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  for (const n of state) {
    const color = getTransparentColor(n.c, 1);

    for (const b of n.values) {
      context.save();
      context.beginPath();
      context.fillStyle = color;
      context.rect(b.x, b.y, b.w, b.h);
      context.fill();
      context.restore();

      if (
        opt.plots.stackLayout === false &&
        opt.plots.metricLabel.enabled === true
      ) {
        drawMetricOntTop(context, b, opt);
      }
    }
  }
};

export default drawCanvas;
