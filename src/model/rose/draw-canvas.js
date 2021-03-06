import { arc } from 'd3-shape';
import { getTransparentColor } from 'vizart-core';
import drawLabel from './draw-label';

const drawCanvas = (context, state, opt) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  const gridArc = arc()
    .startAngle(d => d.startAngle)
    .endAngle(d => d.endAngle)
    .innerRadius(d => d.r0)
    .outerRadius(d => d.r)
    .padAngle(opt.padAngle)
    .context(context);

  for (const d of state) {
    context.shadowBlur = 10;
    let maxR = 0;
    for (let e of d.slice) {
      context.save();
      context.translate(opt.chart.width / 2, opt.chart.height / 2);
      context.beginPath();
      context.fillStyle = getTransparentColor(e.c, e.alpha);
      context.strokeWidth = 1;
      context.strokeStyle = e.c;
      context.shadowColor = e.c;

      gridArc(e);
      context.fill();
      context.stroke();
      context.restore();

      maxR = Math.max(maxR, e.r);
    }

    drawLabel(context, opt, d.dimension, d.i, state.length, maxR, 1);
  }
};

export default drawCanvas;
