import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import isFunction from 'lodash-es/isFunction';
import { check } from 'vizart-core';

const updateRadiusScale = (opt, data) => {
  const radiusDef = opt.r;

  if (check(radiusDef.scale) && isFunction(radiusDef.scale)) {
    opt.data.r.scale = radiusDef.scale;
  } else {
    if (check(opt.data.r) && check(opt.data.r.accessor)) {
      const range = extent(data, d => d[opt.data.r.accessor]);

      opt.data.r.min = range[0];
      opt.data.r.max = range[1];

      opt.data.r.scale = scaleLinear()
        .domain([opt.data.r.min, opt.data.r.max])
        .range([radiusDef.min, radiusDef.max]);
    } else {
      opt.data.r.scale = null;
    }
  }
};

export default updateRadiusScale;
