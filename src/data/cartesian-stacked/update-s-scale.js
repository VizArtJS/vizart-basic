import uniq from 'lodash-es/uniq';
import map from 'lodash-es/map';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';

const updateSeriesScale = (_data, _options)=> {
    if ( !isUndefined(_options.data.s)
        && !(isNull(_options.data.zs))
        && !isUndefined(_options.data.s.accessor)
        && !(isNull(_options.data.s.accessor))) {
        _options.data.s.values = uniq(map(_data, _options.data.s.accessor));
    }
}

export default updateSeriesScale;

