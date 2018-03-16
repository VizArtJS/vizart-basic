import { abstractArea } from '../area';

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

const line = abstractArea(LineOptions);

export default line;
