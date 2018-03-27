import { Stacks } from '../data';

const apiGroup = state => ({
  group: () => {
    state._options.plots.stackLayout = false;
    state.update();
  },
});

const toLayout = (state, layout) => () => {
  state._options.plots.stackLayout = true;
  state._options.plots.stackMethod = layout;
  state.update();
};

const apiStack = state => ({
  stack: toLayout(state, Stacks.Zero),
});

const apiExpand = state => ({
  expand: toLayout(state, Stacks.Expand),
});

const apiWiggle = state => ({
  wiggle: toLayout(state, Stacks.Wiggle),
});

const apiSilhouette = state => ({
  silhouette: toLayout(state, Stacks.Silhouette),
});

const apiDivergent = state => ({
  divergent: toLayout(state, Stacks.Divergent),
});

export {
  apiGroup,
  apiStack,
  apiExpand,
  apiWiggle,
  apiSilhouette,
  apiDivergent,
};
