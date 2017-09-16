import cloneDeep from 'lodash-es/cloneDeep';
import sortData from '../processor/sort';
import cleanse from '../processor/cleanse';
import updateOptionScales from './update-scale';

/**
 *
 * @param _data is immutable
 * @param _options _options
 */
const processCartesianData = (_data, _options, _cleanse = true)=> {
    const _copy = cloneDeep(_data);
    // a cleansed copy of data.
    let _cleansed = (_cleanse === true)
        ? cleanse(_copy, _options)
        : _copy;

    sortData(_cleansed, _options);

    updateOptionScales(_cleansed, _options);

    return _cleansed;
}

export default processCartesianData