import find from 'lodash-es/find';
import { check } from 'vizart-core';

import getAllDataDef from './all-data-def';

const getSortDef = opt=> {
    let allFields = getAllDataDef(opt);

    let _field = find(allFields, o=> o.accessor === opt.ordering.accessor);

    if(!check(_field)) {
        throw new Error('ordering accessor is invalid');
    }

    return _field;
}

export default getSortDef;
