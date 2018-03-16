import { mergeBase } from 'vizart-core';
import CartesianStackedOptions from './CartesianStackedOptions';

const createCartesianStackedOpt = (chartOpt, userOpt) => {
  const cartesianOpt = mergeBase(CartesianStackedOptions, chartOpt, userOpt);

  cartesianOpt.ordering.accessor = cartesianOpt.data.x.accessor;

  return cartesianOpt;
};

export default createCartesianStackedOpt;
