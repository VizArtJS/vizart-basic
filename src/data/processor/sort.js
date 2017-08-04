import { Globals, check } from 'vizart-core'
import has from 'lodash-es/has';
import getSortDef from '../helper/get-sort-def';

const sortData = (_data, _options)=> {
    if (has(_options, 'ordering')) {
        let _field = getSortDef(_options);

        let _accessor = _field.accessor;

        switch (_field.type) {
            case Globals.DataType.STRING:
                _data.sort(function (a, b) {
                    return (_options.ordering.direction === 'asc')
                        ? a[_accessor].localeCompare(b[_accessor])
                        : b[_accessor].localeCompare(a[_accessor]);
                });
                break;
            default:
                _data.sort(function (a, b) {
                    return (_options.ordering.direction === 'asc')
                        ? a[_accessor] - b[_accessor]
                        : b[_accessor] - a[_accessor];
                });

                break;
        }
    }
}

export default sortData;
