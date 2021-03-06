import { verticalGradient } from 'vizart-core';
import { area } from 'd3-shape';

import interpolateCurve from '../../util/curve';
import nodeColor from './node-color';

const drawArea = (context, particles, opt) => {
  context.save();

  const curve = area()
    .x(d => d.x)
    .y0(context.canvas.height)
    .y1(d => d.y)
    .context(context);

  interpolateCurve(opt.plots.curve, [curve]);
  context.beginPath();
  curve(particles);
  context.lineWidth = opt.plots.strokeWidth;
  const gradientStyle = verticalGradient(
    context,
    opt.color.scheme,
    opt.plots.areaOpacity
  );
  context.fillStyle = gradientStyle;
  context.strokeStyle = nodeColor(opt);
  context.stroke();

  context.fill();
  context.closePath();

  context.restore();
};

export default drawArea;
