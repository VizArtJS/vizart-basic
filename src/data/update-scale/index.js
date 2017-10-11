import updateDimensionScale from './update-dim-scale';
import updateMetricScale from './update-metric-scale';

const updateOptionScales = (data, opt)=> {
    updateDimensionScale(data, opt);
    updateMetricScale(data, opt);
}

export default updateOptionScales;