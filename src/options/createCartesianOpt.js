import { mergeBase, mergeOptions } from 'vizart-core';
import has from 'lodash-es/has';
import CartesianOptions from './CartesianOptions';

const createCartesianOpt = (_chartOpt, _userOpt) => {
  let cartesianOpt = mergeBase(CartesianOptions, _chartOpt, _userOpt);

  if (!has(_userOpt, 'ordering')) {
    cartesianOpt.ordering.accessor = cartesianOpt.data.x.accessor;
  }

  return cartesianOpt;
};

export default createCartesianOpt;
