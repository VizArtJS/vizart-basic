import animate from './animate';
import build from '../../helper/buildCartesian';

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

const area = build(AreaOpt, animate);

export default area;
