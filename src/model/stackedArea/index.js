import { stacked } from '../../helper/builder';
import { apiGroup, apiStack, apiExpand } from '../../helper/api-layout';

import animate from './animate';
import StackedOptions from './options';

const stackedArea = stacked(StackedOptions, animate, [
  apiGroup,
  apiStack,
  apiExpand,
]);

export default stackedArea;
