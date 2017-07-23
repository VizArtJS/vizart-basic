import { FieldType } from 'vizart-core';
import { AbstractBasicCartesianChartWithAxes } from '../../base';
import createCartesianOpt from '../../options/createCartesianOpt';
import './Scatter.css';

const ScatterOptions = {
    chart: {
        type: 'scatter',
    },
    plots: {
        blur: false,
        opacity: 1,
        bubble: {
            min: 6,
            max: 20,
            default: 8
        }
    },

    zAxis: {
        allowDecimals: false,
        scale: null,
        max: 100,
        min: 0,
    },

    data: {
        z: {
            accessor: null,
            type:  FieldType.NUMBER,
            formatter:  null,
        },
    }
};

class Scatter extends AbstractBasicCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this.dotGroup;

        this._getRadius = ()=> {
            return this._options.data.z;
        };

        this._getRadiusValue = (d)=> {
            return (this._getRadius() && this._getRadius().accessor)
                ? d[this._getRadius().accessor]
                : null;
        };

        this._z = (d)=> {
            return (this._getRadius() && this._getRadius().accessor)
                ? this._getRadius().scale(this._getRadiusValue(d))
                : this._options.plots.bubble.default;
        }


        this._refreshZScale = ()=> {
            if (this._getRadius() && this._getRadius().accessor) {
                this._getRadius().scale.range(
                    [this._options.plots.bubble.min, this._options.plots.bubble.max]
                )
            }
        }

    }

    render (_data) {
        super.render(_data);
        this.dotGroup = this._svg.append('g').attr('class', 'dot-group');

        this.update();
    };

    update() {
        super.update();
        this._refreshZScale();

        let circles = this.dotGroup.selectAll('.scatter-dot')
            .data(this._data);

        circles.exit()
            .transition("ease-transition")
            .duration(this._options.animation.duration.remove )
            .attr('opacity', 0)
            .attr('r', 1)
            .attr('cy', (this._options.chart.innerHeight + this._options.chart.margin.top - 20))
            .remove();


        circles
            .attr('data-dimension', this.voronoiSelector)
            .transition("update-transition")
            .duration((d, i)=> { return this._options.animation.duration.add / this._data.length * i; })
            .delay((d, i)=>{ return i / this._data.length * this._options.animation.duration.update;})
            .attr('cx', this._x)
            .attr('cy',this. _y)
            .attr('r', this._z)

            .style('opacity', this._options.plots.opacity)
            .attr('fill', this._c);


        circles.enter().append('circle')
            .attr('cx', this._x)
            .attr('cy', (this._options.chart.innerHeight + this._options.chart.margin.top - 20))
            .attr('r', this._z)
            .attr('class', 'scatter-dot')
            .attr('data-dimension', this.voronoiSelector)
            .attr('fill', this._c)
            .style('opacity',0)
            .transition("append-circle-transition")
            .duration((d, i)=> { return this._options.animation.duration.add / this._data.length * i; })
            .delay((d, i)=> { return i / this._data.length * this._options.animation.duration.add;})
            .style('opacity', this._options.plots.opacity)
            .attr('cy', this._y);

        this._bindTooltip(this.dotGroup.selectAll('.scatter-dot'))

    }

    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this.dotGroup.selectAll('.scatter-dot')
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> { return i / this._data.length * this._options.animation.duration.update;})
            .attr('fill', this._c);
    };


    createOptions(_userOpt) {
        return createCartesianOpt(ScatterOptions, _userOpt);
    };
}

export default Scatter;