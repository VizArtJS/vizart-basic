import { genericColor, categoricalColor } from 'vizart-core';

import createCartesianStackedOpt from '../options/createCartesianStackedOpt';
import { processCartesianData, processStackedData } from '../data';
import createCartesianOpt from '../options/createCartesianOpt';

const stackedComposer = ChartOpt => ({
  opt: opt => createCartesianStackedOpt(ChartOpt, opt),
  data: processStackedData,
  color: (colorOpt, data, opt) => {
    const distinct = data && data.nested ? data.nested.length : 0;
    return categoricalColor(opt.color.scheme, distinct);
  },
});

const standardComposer = ChartOpt => ({
  opt: opt => createCartesianOpt(ChartOpt, opt),
  data: processCartesianData,
  color: (colorOpt, data, opt) =>
    genericColor(colorOpt, data.map(d => d[opt.data.y[0].accessor])),
});

export { stackedComposer, standardComposer };
