import { check } from 'vizart-core';
import isSeriesDefined from './is-series-defined';

const getAllDataDef = opt=> {
    let allFields = [].concat(opt.data.x,
        opt.data.y);

    if (isSeriesDefined(opt)) {
        allFields = allFields.concat([opt.data.s])
    }

    return allFields;
}

export default getAllDataDef;