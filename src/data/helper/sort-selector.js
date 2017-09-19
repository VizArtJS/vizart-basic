import { Globals } from 'vizart-core';
import getSortDef from './get-sort-def';

const sortSelector = (selector, opt)=> {
    const _field = getSortDef(opt);
    const _accessor = _field.accessor;

    selector
        .sort((a, b) => {
            if (_field.type === Globals.DataType.STRING) {
                return (direction === 'asc')
                    ? a[_accessor].localeCompare(b[_accessor])
                    : b[_accessor].localeCompare(a[_accessor]);
            } else {
                return (direction === 'asc')
                    ? a[_accessor] - b[_accessor]
                    : b[_accessor] - a[_accessor];
            }
        });
}

export default sortSelector;