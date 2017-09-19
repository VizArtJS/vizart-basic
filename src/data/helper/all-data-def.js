import { check } from 'vizart-core';

const getAllDataDef = (opt)=> {
    let allFields = [].concat(opt.data.x,
        opt.data.y);

    if (check(opt.data.z)) {
        allFields = allFields.concat([opt.data.z])
    }

    if (check(opt.data.s)) {
        allFields = allFields.concat([opt.data.s])
    }

    return allFields;
}

export default getAllDataDef;