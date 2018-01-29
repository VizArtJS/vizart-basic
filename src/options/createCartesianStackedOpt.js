import { mergeBase } from 'vizart-core';
import CartesianStackedOptions from './CartesianStackedOptions';

const createCartesianStackedOpt = (_chartOpt, _userOpt) => {
  let cartesianOpt = mergeBase(CartesianStackedOptions, _chartOpt, _userOpt);

  cartesianOpt.ordering.accessor = cartesianOpt.data.x.accessor;

  return cartesianOpt;
};

export default createCartesianStackedOpt;
