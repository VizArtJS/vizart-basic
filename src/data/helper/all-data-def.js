import { check } from 'vizart-core';

const getAllDataDef = (_options)=> {
    let _allFields = [].concat(_options.data.x,
        _options.data.y);

    if (check(_options.data.z)) {
        _allFields = _allFields.concat([_options.data.z])
    }

    if (check(_options.data.s)) {
        _allFields = _allFields.concat([_options.data.s])
    }

    return _allFields;
}

export default getAllDataDef;