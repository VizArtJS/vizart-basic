import { Stacks } from '../../data';
import animate from './animte';
import build from '../../helper/buildStack';

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

const stream = build(StreamOpt, animate);

export default stream;
