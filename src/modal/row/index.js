import { cartesian } from '../../helper/builder';
import animate from './animate';

const DefaultOpt = {
  chart: { type: 'row' },
  plots: {
    barLabel: {
      enabled: false,
      color: 'black',
    },
    metricLabel: {
      enabled: false,
      color: 'black',
      offset: 10,
    },

    enableMiniBar: true,
    miniBarWidth: 50,
    bottomAxisOffset: 10,
    initialBrushHeight: 200,
  },
};

const row = cartesian(DefaultOpt, animate);

export default row;
