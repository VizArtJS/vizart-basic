import { Stacks } from '../../data';

const GroupedOptions = {
  animation: {
    duration: {
      layout: 500,
    },
  },
  chart: {
    type: 'bar_grouped',
  },
  plots: {
    stackLayout: false,
    stackMethod: Stacks.Zero,
    opacity: 1,
    barLabel: {
      enabled: true,
      color: 'black',
    },
    metricLabel: {
      enabled: true,
      color: 'black',
      offset: 10,
    },
  },
};

export default GroupedOptions;
