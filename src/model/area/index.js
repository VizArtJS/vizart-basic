import animate from './animate';
import { cartesian } from '../../helper/builder';

const AreaOpt = {
  chart: {
    type: 'area_horizontal',
  },
  plots: {
    areaOpacity: 0.3,
    curve: 'basis',
    strokeWidth: 2,
    highlightNodeColor: '#F03E1E',
    nodeRadius: 4,
    drawArea: true,
    showDots: false,
  },
};

const area = cartesian(AreaOpt, animate);

export default area;
