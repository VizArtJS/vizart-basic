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

const AreaMultiOptions = {
  chart: {
    type: 'area_multi',
  },
  animation: {
    duration: {
      curve: 500,
    },
  },
  plots: {
    stackLayout: false,
    stackMethod: Stacks.Zero,
    showDots: false,
    highlightNodeColor: '#F03E1E',
    curve: 'basis',
    strokeWidth: 2,
    opacityArea: 0.7,
  },
};

const ExpandedOptions = {
  chart: {
    type: 'area_expanded',
  },
  animation: {
    duration: {
      curve: 500,
    },
  },
  plots: {
    stackLayout: true,
    stackMethod: Stacks.Expand,
    highlightNodeColor: '#F03E1E',
    showDots: false,
    curve: 'basis',
    strokeWidth: 2,
    opacityArea: 0.7,
  },
};

export { StackedOptions, AreaMultiOptions, ExpandedOptions };
