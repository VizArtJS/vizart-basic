import uniq from 'lodash-es/uniq';
import map from 'lodash-es/map';

const seriesScale = (_data, _options)=> {
    _options.data.s.values = uniq(map(_data, _options.data.s.accessor));
}

export default seriesScale;

