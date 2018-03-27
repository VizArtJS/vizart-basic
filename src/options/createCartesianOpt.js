import { mergeOptions } from 'vizart-core';

import CartesianOptions from './CartesianOptions';

const createCartesianOpt = (chartOpt, userOpt) => {
  const cartesianOpt = mergeOptions(CartesianOptions, chartOpt, userOpt);

  if (!userOpt.hasOwnProperty('ordering')) {
    cartesianOpt.ordering.accessor = cartesianOpt.data.x.accessor;
  }

  return cartesianOpt;
};

export default createCartesianOpt;
