import { pie, arc } from 'd3-shape';

import centroidOnArc from './centroid-on-arc';
import drawControlPoint from './draw-control-point';
import drawPolyLine from './draw-polyline-label';

const drawCanvas = (context, state, opt) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  const radius =
    Math.min(opt.chart.innerWidth, opt.chart.innerHeight) / 2 -
    opt.plots.outerRadiusMargin;
  const arcDiagram = arc()
    .outerRadius(radius)
    .innerRadius(
      () => (opt.plots.isDonut ? radius * opt.plots.innerRadiusRatio : 0)
    )
    .context(context);

  const pieDiagram = pie()
    .sort(null)
    .value(d => d.y);

  const slices = pieDiagram(state);

  context.save();
  context.translate(opt.chart.innerWidth / 2, opt.chart.innerHeight / 2);

  for (const s of slices) {
    context.beginPath();
    arcDiagram(s);
    context.fillStyle = s.data.c;
    context.fill();

    const outerArc = arc()
      .innerRadius(radius)
      .outerRadius(radius)
      .context(context);
    const centroid = centroidOnArc(outerArc, context, radius, s);

    drawControlPoint(context, s, centroid, opt);
    drawPolyLine(context, s, centroid, opt);
  }
  context.restore();
};

export default drawCanvas;
