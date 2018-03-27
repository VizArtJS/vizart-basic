import getAllDataDef from './all-data-def';

const getSortDef = opt => {
  const allFields = getAllDataDef(opt);

  const _field = allFields.find(o => o.accessor === opt.ordering.accessor);

  if (_field === undefined || _field === null) {
    throw new Error('ordering accessor is invalid');
  }

  return _field;
};

export default getSortDef;
