import { polar } from '../../helper/builder';
import animate from './animate';

const PieOptions = {
  chart: {
    type: 'pie',
  },
  plots: {
    othersTitle: 'Others',
    isDonut: false,
    opacity: 0.8,
    innerRadiusRatio: 0.4,
    outerRadiusMargin: 30,
    labelOffset: 20,
    labelControlPointRadius: 6,
    labelPosition: 'auto',
    labelMinPercentage: 0.01,
  },
};

const pie = polar(PieOptions, animate);

export default pie;
