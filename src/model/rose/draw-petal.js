import { select } from 'd3-selection';
import isNaN from 'lodash-es/isNaN';
import { getTransparentColor } from 'vizart-core';
import drawLabel from './draw-label';

const drawPetal = (context, selection, opt, sliceNum) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  selection.each(function(g) {
    const group = select(this);
    const scale = group.attr('scale');

    let maxR = 0;
    group.selectAll('.petal').each(function(d) {
      context.save();
      context.translate(opt.chart.width / 2, opt.chart.height / 2);

      const petal = select(this);
      const color = petal.attr('fill');

      context.beginPath();
      context.fillStyle = color;
      context.fillStyle = getTransparentColor(color, petal.attr('opacity'));
      context.strokeWidth = 1;
      context.strokeStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 10;

      const p = new Path2D(petal.attr('d'));
      context.scale(scale, scale);
      context.fill(p);
      context.stroke(p);
      context.closePath();
      context.restore();

      if (!isNaN(+petal.attr('r'))) {
        maxR = Math.max(maxR, +petal.attr('r'));
      }
    });

    drawLabel(context, opt, g.dimension, g.i, sliceNum, maxR, scale);
  });
};

export default drawPetal;
