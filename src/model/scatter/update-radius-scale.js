import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import isFunction from '../../util/isFunction';

const updateRadiusScale = state => {
  const { _options, _data } = state;
  const radiusDef = _options.r;

  if (
    radiusDef.scale !== undefined &&
    radiusDef.scale !== null &&
    isFunction(radiusDef.scale)
  ) {
    _options.data.r.scale = radiusDef.scale;
  } else {
    if (
      _options.data.r !== undefined &&
      _options.data.r !== null &&
      _options.data.r.accessor !== undefined &&
      _options.data.r.accessor !== null
    ) {
      const range = extent(_data, d => d[_options.data.r.accessor]);

      _options.data.r.min = range[0];
      _options.data.r.max = range[1];

      _options.data.r.scale = scaleLinear()
        .domain([_options.data.r.min, _options.data.r.max])
        .range([radiusDef.min, radiusDef.max]);
    } else {
      _options.data.r.scale = null;
    }
  }
};

export default updateRadiusScale;
