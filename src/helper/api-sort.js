const apiSort = state => ({
  sort(accessor, direction = 'asc') {
    if (direction !== 'asc' && direction !== 'desc') {
      console.error('invalid direction, only asc and desc are supported');
    }

    state._options.ordering = {
      accessor,
      direction,
    };

    state.update();
  },
});

export default apiSort;
