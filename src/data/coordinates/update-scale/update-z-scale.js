import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import isUndefined from 'lodash-es/isUndefined';
import isNull from 'lodash-es/isNull';

const updateZScale = (_data, _options)=> {
    if ( !isUndefined(_options.data.z)
        && !(isNull(_options.data.z))
        && !isUndefined(_options.data.z.accessor)
        && !(isNull(_options.data.z.accessor))) {
        let _range = extent(_data,  (d)=> { return d[_options.data.z.accessor];  });

        _options.data.z.min = _range[0];
        _options.data.z.max = _range[1];

        _options.data.z.scale = scaleLinear()
            .domain([_options.data.z.min, _options.data.z.max])
            .range([_options.plots.bubble.min, _options.plots.bubble.max]);
    }
};

export default updateZScale;