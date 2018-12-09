import { polarStacked } from '../../helper/builder';
import animate from '../corona/animate';
import { apiExpand, apiGroup, apiStack } from '../../helper/api-layout';

const RadarOptions = {
  chart: {
    type: 'radar',
    margin: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  },
  plots: {
    levels: 0, //How many levels or inner circles should there be drawn
    levelColor: '#CDCDCD',
    levelLabelColor: '#737373',
    levelLabelPosition: 'top', //'top', 'bottom', 'right'
    levelLabel: null,

    axisLabel: null,
    axisLabelColor: '#737373',
    axisLabelOffset: 10, //How much farther than the radius of the outer circle should the labels be placed

    highlightStrokeColor: '#000000',
    highlightNodeColor: 'green',
    highlightLabelColor: '#000000',

    strokeOpacity: 1,
    strokeWidth: 4, //The width of the stroke around each blob

    drawBoundary: true,
    boundaryOffset: 10,
    boundaryOpacity: 0.5,
    boundaryGradient: ['white', '#eb3ba6'],

    innerRadiusRatio: 0.4,
    outerRadiusMargin: 60,
  },
};

const radar = polarStacked(RadarOptions, animate, [
  apiGroup,
  apiStack,
  apiExpand,
]);

export default radar;
