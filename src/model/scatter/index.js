import { Globals } from 'vizart-core';
import animate from './animate';
import { cartesian } from '../../helper/builder';

const ScatterOptions = {
  chart: {
    type: 'scatter',
  },
  plots: {
    opacity: 1,
  },

  r: {
    scale: null,
    max: 20,
    min: 6,
    default: 8,
  },

  data: {
    r: {
      accessor: null,
      type: Globals.DataType.NUMBER,
      formatter: null,
    },
  },
};

const scatter = cartesian(ScatterOptions, animate);

export default scatter;
