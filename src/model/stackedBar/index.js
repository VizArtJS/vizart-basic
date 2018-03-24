import { stacked } from '../../helper/builder';
import { apiGroup, apiStack, apiExpand } from '../../helper/api-layout';

import animate from './animate';
import GroupedOptions from './options';

const stackedBar = stacked(GroupedOptions, animate, [
  apiGroup,
  apiStack,
  apiExpand,
]);

export default stackedBar;
