import { line } from 'd3-shape';
import { hsl } from 'd3-color';
import interpolateCurve from '../../util/curve';

const highlightLine = (context, state, opt, highlighted) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  const curve = line()
    .x(d => d.x)
    .y(d => d.y)
    .context(context);

  for (const n of state) {
    context.save();

    const color = n.c;
    const hslColorSpace = hsl(color);
    hslColorSpace.opacity = n.key === highlighted.key ? n.alpha : 0.2;
    context.strokeStyle = hslColorSpace;

    interpolateCurve(opt.plots.curve, [curve]);
    context.beginPath();
    curve(n.values);
    context.lineWidth = opt.plots.strokeWidth;
    context.stroke();
    context.restore();
  }
};

export default highlightLine;
