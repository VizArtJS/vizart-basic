import find from 'lodash-es/find';

import getAllDataDef from './all-data-def';

const getSortDef = opt => {
  let allFields = getAllDataDef(opt);

  let _field = find(allFields, o => o.accessor === opt.ordering.accessor);

  if (_field === undefined || _field === null) {
    throw new Error('ordering accessor is invalid');
  }

  return _field;
};

export default getSortDef;
