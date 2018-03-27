import { Stacks } from '../../data';

const StackedOptions = {
  chart: {
    type: 'area_stacked',
  },
  animation: {
    duration: {
      curve: 500,
    },
  },
  plots: {
    stackLayout: true,
    stackMethod: Stacks.Zero,
    showDots: false,
    curve: 'basis',
    strokeWidth: 2,
    highlightNodeColor: '#F03E1E',
    opacityArea: 0.7,
  },
};

export default StackedOptions;
