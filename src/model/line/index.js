import animate from '../area/animate';
import { cartesian } from '../../helper/builder';

const LineOptions = {
  chart: {
    type: 'line',
  },
  plots: {
    curve: 'linear',
    strokeWidth: 3,
    nodeRadius: 4,
    highlightNodeColor: '#F03E1E',
    drawArea: false,
    showDots: true,
  },
};

const line = cartesian(LineOptions, animate);

export default line;
