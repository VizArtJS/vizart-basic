import cloneDeep from 'lodash-es/cloneDeep';
import sortData from '../processor/sort';
import cleanse from '../processor/cleanse';
import updateOptionScales from '../update-scale/index';

/**
 *
 * @param data is immutable
 * @param opt _options
 */
const processCartesianData = (data, opt, cleanseData = true)=> {
    const copy = cloneDeep(data);
    // a cleansed copy of data.
    let cleansed = cleanseData === true
        ? cleanse(copy, opt)
        : copy;

    sortData(cleansed, opt);
    updateOptionScales(cleansed, opt);

    return cleansed;
}

export default processCartesianData