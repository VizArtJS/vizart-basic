import {
  stack,
  stackOffsetExpand,
  stackOffsetNone,
  stackOffsetSilhouette,
  stackOffsetWiggle,
  stackOffsetDiverging,
  stackOrderAscending,
  stackOrderNone,
  stackOrderReverse,
  stackOrderDescending,
  stackOrderInsideOut,
} from 'd3-shape';

import Stacks from '../constant/stack-methods';

const getSeriesOrdering = opt => {
  switch (opt.ordering.direction) {
    case 'asc':
      return stackOrderAscending;
    case 'desc':
      return stackOrderDescending;
    case 'none':
      return stackOrderNone;
    case 'reverse':
      return stackOrderReverse;
    default:
      return stackOrderNone;
  }
};

const getStack = opt => {
  const stackLayout = stack();
  const ordering = getSeriesOrdering(opt);

  switch (opt.plots.stackMethod) {
    case Stacks.Expand:
      stackLayout.offset(stackOffsetExpand).order(ordering);
      break;
    case Stacks.Zero:
      stackLayout.offset(stackOffsetNone).order(ordering);
      break;
    case Stacks.Silhouette:
      stackLayout.offset(stackOffsetSilhouette).order(stackOrderInsideOut);
      break;
    case Stacks.Wiggle:
      stackLayout.offset(stackOffsetWiggle).order(stackOrderInsideOut);
      break;
    case Stacks.Divergent:
      stackLayout.offset(stackOffsetDiverging).order(stackOrderInsideOut);
      break;

    default:
      stackLayout.offset(stackOffsetNone);
      break;
  }

  return stackLayout;
};
export default getStack;
