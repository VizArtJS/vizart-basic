const isYSort = opt => {
  for (let y of opt.data.y) {
    if (opt.ordering.accessor === y.accessor) {
      return true;
    }
  }

  return false;
};

export default isYSort;
