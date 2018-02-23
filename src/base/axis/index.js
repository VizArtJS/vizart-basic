
export { default as renderAxis } from './renter';
export { default as updateAxis } from './update';

const axis = (chart)=> (Object.assign(chart, {
    render: (data)=> {
        chart.render(data);

        renderAxis(this._svg, this._data, this._options);
    },
    update: ()=> {
        chart.update();

        updateAxis(this._svg, this._data, this._options);
    },
}));

export default axis;
