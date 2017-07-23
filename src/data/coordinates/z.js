import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

const zScale = (_data, _options)=> {
    if ( _options.data.z &&  _options.data.z.accessor !== null) {

        // todo number format
        let _range = extent(_data,  (d)=> { return d[_options.data.z.accessor];  });

        _options.data.z.min = _range[0];
        _options.data.z.max = _range[1];

        _options.data.z.scale = scaleLinear()
            .domain([_options.data.z.min, _options.data.z.max])
            .range([_options.plots.bubble.min, _options.plots.bubble.max]);
    }
};

export default zScale;