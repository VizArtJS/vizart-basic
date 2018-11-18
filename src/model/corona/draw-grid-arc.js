import { arc } from 'd3-shape';
import getLevels from './get-grid-levels';
import getRadius from './get-radius';

const drawGridArc = (context, opt) => {
  const [innerRadius, outerRadius] = getRadius(opt);

  context.save();
  context.translate(opt.chart.width / 2, opt.chart.height / 2);
  const levels = getLevels(opt);

  const gridArc = arc()
    .innerRadius(
      d => ((outerRadius - innerRadius) / levels) * (d - 1) + innerRadius
    )
    .outerRadius(d => ((outerRadius - innerRadius) / levels) * d + innerRadius)
    .startAngle(0)
    .endAngle(2 * Math.PI)
    .context(context);

  for (let i = 1; i < levels + 1; i++) {
    context.beginPath();
    context.strokeStyle = opt.plots.levelColor;
    gridArc(i);
    context.stroke();
  }

  context.restore();
};

export default drawGridArc;
