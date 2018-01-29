import { Globals } from 'vizart-core';
import toString from 'lodash-es/toString';
import toNumber from 'lodash-es/toNumber';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';
import isDate from 'lodash-es/isDate';
import isFunction from 'lodash-es/isFunction';
import { timeParse } from 'd3-time-format';
import getAllFields from '../helper/all-data-def';

let cleanse = (_data, _options) => {
  let _allFields = getAllFields(_options);

  return _data.map(d => {
    let _d = d;

    for (let _dim of _allFields) {
      switch (_dim.type) {
        case Globals.DataType.DATE:
          if (isNull(_dim.format) || isUndefined(_dim.format)) {
            if (!isDate(d[_dim.accessor])) {
              throw new Error(
                _dim.accessor + "'s date format is not specified."
              );
            } else {
              _d[_dim.accessor] = d[_dim.accessor];
            }
          } else {
            if (isFunction(_dim.format)) {
              _d[_dim.accessor] = _dim.format(d[_dim.accessor]);
            } else {
              const parser = timeParse(_dim.format);
              _d[_dim.accessor] = parser(d[_dim.accessor]);
            }
          }

          break;

        case Globals.DataType.NUMBER:
          _d[_dim.accessor] = toNumber(d[_dim.accessor]);

          break;
        case Globals.DataType.STRING:
          _d[_dim.accessor] = toString(d[_dim.accessor]);
          break;

        default:
          _d[_dim.accessor] = d[_dim.accessor];
          break;
      }
    }

    return _d;
  });
};

export default cleanse;
