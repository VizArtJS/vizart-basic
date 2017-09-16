import updateDimensionScale from './update-dim-scale';
import updateSeriesScale from './update-s-scale';
import updateMetricScale from './update-metric-scale';

const updateOptionScales = (_data, _options)=> {
    updateDimensionScale(_data, _options);
    updateSeriesScale(_data, _options);
    updateMetricScale(_data, _options);
}

export default updateOptionScales;