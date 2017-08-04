import { Globals, check } from 'vizart-core';
import toString from 'lodash-es/toString';
import toNumber from 'lodash-es/toNumber';
import { timeParse } from 'd3-time-format';
import getAllFields from '../helper/all-data-def';

// todo null val check
let cleanse = (_data, _options)=> {
    let _allFields = getAllFields(_options);

    for (let d of _data) {
        for (let _dim of _allFields) {
            switch (_dim.type) {
                case Globals.DataType.DATE:
                    let parser = timeParse(_dim.format);
                    d[_dim.accessor] = parser(d[_dim.accessor]);

                    break;

                case Globals.DataType.NUMBER:
                    // todo number format
                    d[_dim.accessor] = toNumber(d[_dim.accessor]);

                    break;
                case Globals.DataType.STRING:
                    d[_dim.accessor] = toString(d[_dim.accessor]);
                    break;

                default:
                    break;
            }
        }
    }
};

export default cleanse;