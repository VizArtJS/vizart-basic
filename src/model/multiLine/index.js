import animate from './animate';
import { stacked } from '../../helper/builder';

const DefaultOptions = {
  chart: {
    type: 'line_multi',
  },
  plots: {
    curve: 'linear',
    highlightNodeColor: '#F03E1E',
    strokeWidth: 3,
    showDots: false,
    dotRadius: 4,
  },
};

const multiLine = stacked(DefaultOptions, animate);

export default multiLine;
