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
    stackOrderInsideOut
} from 'd3-shape';

import Stacks from '../constant/stack-methods';

const getSeriesOrdering = opt => {
    switch(opt.ordering.direction) {
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
}

const getStack = opt=> {
    // nested data
    const _stack = stack();
    const _ordering = getSeriesOrdering(opt);

    switch(opt.plots.stackMethod) {
        case Stacks.Expand:
            _stack.offset(stackOffsetExpand).order(_ordering);
            break;
        case Stacks.Zero:
            _stack.offset(stackOffsetNone).order(_ordering);
            break;
        case Stacks.Silhouette:
            _stack.offset(stackOffsetSilhouette).order(stackOrderInsideOut);
            break;
        case Stacks.Wiggle:
            _stack.offset(stackOffsetWiggle).order(stackOrderInsideOut);
            break;
        case Stacks.Divergent:
            _stack.offset(stackOffsetDiverging).order(stackOrderInsideOut);
            break;

        default:
            _stack.offset(stackOffsetNone);
            break;
    }

    return _stack;
}
export default getStack;