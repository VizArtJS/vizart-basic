import { genericColor } from 'vizart-core';
import { renderAxis, updateAxis } from './axis';
import { processCartesianData } from '../data';

const cartesianBasic = (chart, axis=true)=> Object.assign({}, chart, {


    render (data) {
        chart.render(data);
        this._color = this._provideColor();

        if (axis === true) renderAxis(this._svg, this._data, this._options);
    },
    update () {
        chart.update();
        this._data = processCartesianData(this._data, this._options, false);

        if (axis === true) updateAxis(this._svg, this._data, this._options);
    },

    data (data){
        if (data !== undefined && data !== null) {
            this._data = processCartesianData(data, this._options, true);
        }
        return this._data;
    },

    _provideColor() {
        const metrics = chart._data.map(chart._getMetricVal);
        return genericColor(this._options.color, metrics);
    }
});

export default cartesianBasic;
