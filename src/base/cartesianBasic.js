import { renderAxis, updateAxis } from './axis';

const cartesianBasic = (chart, axis=true)=> Object.assign({}, chart, {
    render (data) {
        console.log(' - 4 - render cartesian basic')
        chart.render(data);
        if (axis === true) renderAxis(chart._svg, this._data, this._options);
    },
    update () {
        chart.update();

        if (axis === true) updateAxis(chart._svg, this._data, this._options);
    },
});

export default cartesianBasic;
