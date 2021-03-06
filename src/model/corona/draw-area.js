import { radialArea, curveCardinalClosed } from 'd3-shape';

import { radialGradient, getTransparentColor } from 'vizart-core';

import getRadius from './get-radius';

const drawArea = (context, state, opt) => {
  const [innerRadius, outerRadius] = getRadius(opt);

  context.save();
  context.translate(opt.chart.width / 2, opt.chart.height / 2);

  for (const n of state) {
    const shape =
      opt.plots.stackLayout === true
        ? radialArea()
            .curve(curveCardinalClosed)
            .angle(d => d.angle)
            .innerRadius(d => d.r0)
            .outerRadius(d => d.r1)
            .context(context)
        : radialArea()
            .curve(curveCardinalClosed)
            .angle(d => d.angle)
            .innerRadius(innerRadius)
            .outerRadius(d => d.r)
            .context(context);

    context.beginPath();

    if (opt.plots.gradientArea === true) {
      context.fillStyle = radialGradient(
        context,
        n.c,
        n.alpha,
        opt.chart.width / 2,
        opt.chart.height / 2,
        innerRadius,
        outerRadius
      );
    } else {
      context.fillStyle = getTransparentColor(n.c, n.alpha);
    }
    shape(n.values);
    context.fill();

    context.lineWidth = opt.plots.strokeWidth;
    context.strokeStyle = getTransparentColor(n.c, n.strokeAlpha);
    context.stroke();
  }

  context.restore();
};

export default drawArea;
