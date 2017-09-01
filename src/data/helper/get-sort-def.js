import find from 'lodash-es/find';
import { check } from 'vizart-core';

import getAllDataDef from './all-data-def';

const getSortDef = (_options)=> {
    let _allFields = getAllDataDef(_options);

    let _field = find(_allFields, (o)=> {
        return o.accessor === _options.ordering.accessor;
    });

    if(!check(_field)) {
        throw new Error('ordering accessor is invalid');
    }

    return _field;
}

export default getSortDef;
