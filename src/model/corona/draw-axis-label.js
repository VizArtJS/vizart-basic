import { scaleLinear } from 'd3-scale';
import { drawCircularText } from 'vizart-core';

import getAxisLabel from './get-axis-label';
import getRadius from './get-radius';

const drawAxisLabel = (context, opt) => {
  let axisNum = 6;
  const axisScale = scaleLinear()
    .domain([0, axisNum])
    .range([0, 2 * Math.PI]);
  const [innerRadius, outerRadius] = getRadius(opt);

  const axes = opt.data.x.values;
  const axesLength = axes.length;

  if (axesLength < axisNum) {
    axisNum = axesLength;
  }

  const mapToAxis = scaleLinear()
    .domain([0, axisNum])
    .range([0, axesLength])
    .nice();

  const toText = i => Math.ceil(mapToAxis(i));

  for (let i = 1; i < axisNum; i++) {
    drawCircularText(
      context,
      getAxisLabel(opt, axes[toText(i)], toText(i)) + '',
      14,
      'Oswald',
      opt.plots.axisLabelColor,
      opt.chart.innerWidth / 2,
      opt.chart.innerHeight / 2,
      outerRadius + opt.plots.axisLabelOffset,
      axisScale(i),
      5
    );
  }
};

export default drawAxisLabel;
