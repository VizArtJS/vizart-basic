import { cartesian } from '../../helper/builder';
import animate from './animate';

const BarOpt = {
  chart: { type: 'bar' },
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
  },
};

const bar = cartesian(BarOpt, animate);

export default bar;
