import { uuid } from 'vizart-core';
import { easeCubicOut } from 'd3-ease';
import { area, line } from 'd3-shape';

import { AbstractBasicCartesianChartWithAxes } from '../../base';
import createCartesianOpt from '../../options/createCartesianOpt';
import interpolateCurve from '../../util/curve';
import LinearGradient from './LinearGradient';

const AreaOpt = {
    chart: {
        type: 'area_horizontal'
    },
    plots: {
        areaOpacity: 1,
        curve: 'cardinal',
        strokeWidth: 4,
        nodeRadius: 4,
        drawArea: true,
        showDots: true
    },
};

class Area extends AbstractBasicCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this.pathLayer;
        this.nodeLayer;
        this._curve;
        this._baseLine;
        this.linearGradent = new LinearGradient(this._options.color.scheme);
        this.nodeColor = () => {
            return this.linearGradent.top();
        };
    }

    render(_data) {
        super.render(_data);

        this.pathLayer = this._svg.append('g').attr('class', 'series-layer');
        this.nodeLayer = this._svg.append('g').attr('class', 'node-layer');

        if (this._options.plots.drawArea === true) {
            this._curve = area()
                .x(this._x)
                .y0(this._options.chart.innerHeight)
                .y1(this._y);

            this._baseLine = area()
                .x(this._x)
                .y0(this._options.chart.innerHeight)
                .y1(this._options.chart.innerHeight);
        } else {
            this._curve = line()
                .x(this._x)
                .y(this._y);

            this._baseLine = line()
                .x(this._x)
                .y(this._options.chart.innerHeight);
        }


        interpolateCurve(this._options.plots.curve, [this._curve, this._baseLine]);
        this.linearGradent.render(this._svg);


        if (this._options.plots.drawArea === true) {
            this.pathLayer.append("path")
                .datum(this._data)
                .style('fill', 'url(' + this.linearGradent.id() + ')')
                .style('stroke', 'none')
                .style('fill-opacity', this._options.plots.areaOpacity)
                .style('stroke-width', this._options.plots.strokeWidth + 'px')
                .attr("d", this._baseLine)
                .attr('class', 'path')
                .transition()
                .duration(this._options.animation.duration.update)
                .delay((d, i) => {
                    return i / this._data.length * this._options.animation.duration.update;
                })
                .attr("d", this._curve);
        } else {
            this.pathLayer.append("path")
                .datum(this._data)
                .style('fill', 'none')
                .style('stroke', 'url(' + this.linearGradent.id() + ')')
                .style('stroke-width', this._options.plots.strokeWidth + 'px')
                .attr("d", this._baseLine)
                .attr('class', 'path')
                .transition()
                .duration(this._options.animation.duration.update)
                .delay((d, i) => {
                    return i / this._data.length * this._options.animation.duration.update;
                })
                .ease(easeCubicOut)
                .attr("d", this._curve);
        }


        this.nodeLayer.selectAll(".node")
            .data(this._data)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", this._options.plots.nodeRadius)
            .attr("cx", this._x)
            .attr("cy", this._options.chart.innerHeight)
            .attr('fill', this.nodeColor)
            .attr('opacity', 0)
            .transition()
            .duration(this._options.animation.duration.update)
            .attr("cy", this._y)
            .attr('opacity', this._options.plots.showDots ? 1 : 0);


        this._bindTooltip(this.nodeLayer.selectAll(".node"));
    }

    update(){
        super.update();

        interpolateCurve(this._options.plots.curve, [this._curve, this._baseLine]);
        this.linearGradent.update(this._options.color.scheme, this._data.length);

        this.pathLayer.select('.path')
            .transition("ease-shape-and-node")
            .duration(this._options.animation.duration.remove)
            .delay( (d, i)=> { return i / this._data.length *this._options.animation.duration.remove; })
            .attr("d", this._baseLine);

        this.nodeLayer.selectAll(".node")
            .transition("ease-shape-and-node")
            .duration(this._options.animation.duration.remove)
            .attr('opacity', 0.2)
            .attr("cy", this._options.chart.innerHeight);


        this.pathLayer.select('.path')
            .datum(this._data)
            .attr("d", this._baseLine)
            .transition("arise-transition")
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> { return i / this._data.length * this._options.animation.duration.update; })
            .style('stroke-width', this._options.plots.strokeWidth + 'px')
            .attr("d", this._curve);

        let nodes_update = this.nodeLayer.selectAll(".node")
            .data(this._data);

        nodes_update.exit()
            .transition("remove-transition")
            .duration(this._options.animation.duration.remove)
            .attr('opacity', 0)
            .remove();

        nodes_update
            .attr("cx", this._x)
            .transition("update-transition")
            .duration(this._options.animation.duration.remove)
            .delay((d, i)=> { return i / this._data.length * this._options.animation.duration.remove })
            .attr('opacity', this._options.plots.showDots ? 1 : 0)
            .attr("r", this._options.plots.nodeRadius)
            .attr("cy", this._y);

        nodes_update.enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", this._options.plots.nodeRadius)
            .attr("cx", this._x)
            .attr("cy", this._options.chart.innerHeight)
            .attr('fill', this.nodeColor)
            .attr('opacity', this._options.plots.showDots ? 0.2 : 0)
            .transition("update-transition")
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> { return i / this._data.length * this._options.animation.duration.update  })
            .attr("cy", this._y)
            .attr('opacity', this._options.plots.showDots ? 1 : 0);


        this._bindTooltip(this.nodeLayer.selectAll(".node"));
    }

    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this.linearGradent.update(this._options.color.scheme, this._data.length);
        // link node
        this.nodeLayer.selectAll(".node")
            .transition()
            .duration(this._options.animation.duration.remove)
            .attr('fill', this.nodeColor);
    };


    createOptions(_userOpt) {
        return createCartesianOpt(AreaOpt, _userOpt);
    };

}


export default Area;