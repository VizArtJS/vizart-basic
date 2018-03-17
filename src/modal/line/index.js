import animate from '../area/animate';
import build from '../../helper/buildCartesian';

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

const line = build(LineOptions, animate);

export default line;
