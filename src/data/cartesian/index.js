import cloneDeep from 'lodash-es/cloneDeep';
import sortData from '../processor/sort';
import cleanse from '../processor/cleanse';
import updateOptionScales from '../update-scale/index';

/**
 *
 * @param data is immutable
 * @param opt _options
 */
const processCartesianData = (data, opt, cleanse = true)=> {
    const _copy = cloneDeep(data);
    // a cleansed copy of data.
    let _cleansed = (cleanse === true)
        ? cleanse(_copy, opt)
        : _copy;

    sortData(_cleansed, opt);

    updateOptionScales(_cleansed, opt);

    return _cleansed;
}

export default processCartesianData