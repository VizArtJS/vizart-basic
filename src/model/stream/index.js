import { Stacks } from '../../data';
import animate from './animate';
import { stacked } from '../../helper/builder';
import {
  apiWiggle,
  apiSilhouette,
  apiDivergent,
} from '../../helper/api-layout';

const StreamOpt = {
  chart: {
    type: 'stream',
  },
  plots: {
    stackLayout: true,
    stackMethod: Stacks.Wiggle,
    highlightNodeColor: '#F03E1E',
    opacityArea: 0.7,
    dotRadius: 8,
  },
};

const stream = stacked(StreamOpt, animate, [
  apiWiggle,
  apiSilhouette,
  apiDivergent,
]);

export default stream;
