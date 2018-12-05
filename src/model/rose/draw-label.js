import getLabelRadius from './get-label-radius';
import { drawCircularText } from 'vizart-core';

const drawLabel = (context, opt, text, i, sliceNum, maxR, scale) => {
  const radius = getLabelRadius(opt, scale, maxR);
  const angle = (2 * Math.PI) / sliceNum;

  drawCircularText(
    context,
    text + '',
    14,
    'Oswald',
    opt.plots.axisLabelColor,
    opt.chart.width / 2,
    opt.chart.height / 2,
    radius,
    angle * i + angle / 2,
    0
  );
};

export default drawLabel;
