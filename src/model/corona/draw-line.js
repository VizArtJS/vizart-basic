import { radialLine, curveLinearClosed } from 'd3-shape';

import { getTransparentColor } from 'vizart-core';

const drawLine = (context, state, opt) => {
  context.save();
  context.translate(opt.chart.width / 2, opt.chart.height / 2);

  for (const n of state) {
    const shape =
      opt.plots.stackLayout === true
        ? radialLine()
            .curve(curveLinearClosed)
            .angle(d => d.angle)
            .radius(d => d.r1)
            .context(context)
        : radialLine()
            .curve(curveLinearClosed)
            .angle(d => d.angle)
            .radius(d => d.r)
            .context(context);

    context.beginPath();
    context.strokeStyle = getTransparentColor(n.c, n.strokeAlpha);
    context.lineWidth = opt.plots.strokeWidth;
    shape(n.values);
    context.stroke();
  }

  context.restore();
};

export default drawLine;
