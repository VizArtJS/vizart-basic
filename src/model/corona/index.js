import { polarStacked } from '../../helper/builder';
import { apiGroup, apiStack, apiExpand } from '../../helper/api-layout';

import animate from './animate';
import CoronaOptions from './options';

const corona = polarStacked(CoronaOptions, animate, [
  apiGroup,
  apiStack,
  apiExpand,
]);

export default corona;
