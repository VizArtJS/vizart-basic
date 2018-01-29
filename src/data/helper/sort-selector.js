import { Globals } from 'vizart-core';
import getSortDef from './get-sort-def';

const sortSelector = (selector, opt) => {
  const field = getSortDef(opt);
  const accessor = opt.ordering.accessor;
  const direction = opt.ordering.direction;

  selector.sort((a, b) => {
    if (field.type === Globals.DataType.STRING) {
      return direction === 'asc'
        ? a[accessor].localeCompare(b[accessor])
        : b[accessor].localeCompare(a[accessor]);
    } else {
      return direction === 'asc'
        ? a[accessor] - b[accessor]
        : b[accessor] - a[accessor];
    }
  });
};

export default sortSelector;
