import { line } from 'd3-shape';
import { verticalGradient } from 'vizart-core';
import interpolateCurve from '../../util/curve';

const drawLine = (context, particles, opt) => {
  context.save();

  const curve = line()
    .x(d => d.x)
    .y(d => d.y)
    .context(context);
  interpolateCurve(opt.plots.curve, [curve]);

  context.beginPath();
  curve(particles);
  context.lineWidth = opt.plots.strokeWidth;
  context.strokeStyle = verticalGradient(context, opt.color.scheme, 1);

  context.stroke();
  context.closePath();
  context.restore();
};

export default drawLine;
