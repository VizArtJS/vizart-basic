import { mergeBase } from 'vizart-core';
import has from 'lodash-es/has';

import CartesianOptions from './CartesianOptions';

const createCartesianOpt = (chartOpt, userOpt) => {
  const cartesianOpt = mergeBase(CartesianOptions, chartOpt, userOpt);

  if (!has(userOpt, 'ordering')) {
    cartesianOpt.ordering.accessor = cartesianOpt.data.x.accessor;
  }

  return cartesianOpt;
};

export default createCartesianOpt;
