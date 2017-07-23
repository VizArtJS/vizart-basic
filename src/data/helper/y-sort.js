const isYSort = (_options)=> {
    for (let _y of _options.data.y) {
        if (_options.ordering.accessor === _y.accessor) {
            return true;
        }
    }

    return false;
}

export default isYSort;