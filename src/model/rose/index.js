import { polarStacked } from '../../helper/builder';
import animate from './animate';

const RoseOpt = {
  chart: {
    type: 'rose',
  },

  plots: {
    innerRadiusRatio: 0.4,
    opacity: 0.5,
    outerRadiusMargin: 10,
    padAngle: 0.04,
    axisLabel: null,
    axisLabelAlign: true,
    axisLabelAlignThreshold: 0.5,
    axisLabelOffset: 10,
    axisLabelColor: 'black',
    dimensionOrder: null,
  },
};

/**
 *
 *"Death is a great price to pay for a red rose," cried the Nightingale,
 * "and Life is very dear to all. It is pleasant to sit in the green wood,
 * and to watch the Sun in his chariot of gold, and the Moon in her chariot of pearl.
 * Sweet is the scent of the hawthorn, and sweet are the bluebells that hide in the valley,
 * and the heather that blows on the hill. Yet love is better than Life, and what is the heart
 * of a bird compared to the heart of a man?"
 *
 * @author Oscar Wilde <The Nightingale And The Rose>
 */
const rose = polarStacked(RoseOpt, animate);

export default rose;
