import { Globals, uuid, AbstractCanvasChart, compose } from 'vizart-core';
import './tooltip.css';
import {select} from 'd3-selection';
import tooltipMarkup from './tooltip';

const renderTooltip = (containerId)=> {
    return select(containerId)
        .append('div')
        .attr('id', 'tooltip-' + uuid())
        .attr('class', 'vizart-tooltip')
        .style('opacity', 0);
}

const cartesian = (chart) => Object.assign({}, chart, {
    _getMetric: () => chart._options.data.y[0],
    _getDimension: () => chart._options.data.x,
    _getDimensionVal: d => d[this._getDimension().accessor],
    _x(d) {
        return this._getDimension().scale(this._getDimensionVal(d));
    },
    _y(d){
        return this._getMetric().scale(this._getMetricVal(d));
    },

    _c(d) {
        if (d.color) {
            return d.color;
        }

        switch (this._options.color.type) {
            case Globals.ColorType.CATEGORICAL:
                return this._color(this._getDimensionVal(d));
            case Globals.ColorType.GRADIENT:
            case Globals.ColorType.DISTINCT:
                return this._color(this._getMetricVal(d));
            default:
                return this._color(this._getMetricVal(d));
        }
    },

    render(data) {
        chart.render(data);

        this._tooltip = renderTooltip(this._containerId);
    },

    sort (_accessor, direction) {
        this._options.ordering = {
            accessor: _accessor,
            direction: direction,
        };

        this.update();
    },

    tooltip (d) {
        return tooltipMarkup(d, this);
    }
});


export default cartesian;
