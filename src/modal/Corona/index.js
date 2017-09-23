import { AbstractStackedCartesianChart } from '../../base';
import { wrapSVGText } from 'vizart-core'
import { CoronaOptions } from './Corona-Options';

import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import metricStackedScale from '../../data/cartesian-stacked/scale-stacked-metric';
import metricScale from '../../data/update-scale/update-metric-scale';
import labelPrecision from './Corona-Label';

import { Stacks } from '../../data';
import './Corona.css';

import {
    arc,
    radialArea,
    radialLine,
    curveLinearClosed,
    curveCardinalClosed
} from 'd3-shape';

import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { range, extent } from 'd3-array';


import isNumber from 'lodash-es/isNumber';


class Corona extends AbstractStackedCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._c = (d) => {
            return this._color(this._s(d));
        };

    }

    createOptions(_userOpt) {
        return createCartesianStackedOpt(CoronaOptions, _userOpt);
    };

    render(_data) {
        super.render(_data);

        this._svg.attr("transform", "translate("
            + (this._options.chart.innerWidth / 2 + this._options.chart.margin.left)
            + ","
            + (this._options.chart.innerHeight / 2 + this._options.chart.margin.top)
            + ")");

        this.axisGrid = this._svg.append("g").attr("class", "axis-wrapper");

        //Filter for the outside glow
        this.filter = this._svg.append('defs').append('filter').attr('id', 'glow');
        this.feGaussianBlur = this.filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
        this.feMerge = this.filter.append('feMerge');
        this.feMergeNode_1 = this.feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        this.feMergeNode_2 = this.feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        //Set up the small tooltip for when you hover over a circle
        this._tooltip = this._svg.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.update();
    }

    update() {
        super.update();

        let that = this;
        let outerRadius = Math.min(this._options.chart.innerWidth / 2, this._options.chart.innerHeight / 2) - 20;
        let innerRadius = outerRadius * this._options.plots.innerRadiusRatio;
        let radiusScale = scaleLinear().range([innerRadius, outerRadius]);
        let angleScale = scaleLinear().range([0, 2 * Math.PI]);

        let angleSlice = ()=> {
            return Math.PI * 2 / this._getDimension().values.length;
        };
        let circleCx = (d, i)=> {
            return this._options.plots.stackLayout === true
                ? radiusScale(d.y) * Math.cos(angleSlice()*i - Math.PI/2)
                : radiusScale(this._getMetricVal(d)) * Math.cos(angleSlice()*i - Math.PI/2);
        };

        let circleCy = (d, i)=> {
            return this._options.plots.stackLayout === true
                ? radiusScale(d.y) * Math.sin(angleSlice()*i - Math.PI/2)
                : radiusScale(this._getMetricVal(d)) * Math.sin(angleSlice()*i - Math.PI/2);
        };

        let baseRadar;
        let radarLine;
        let easeRadar;

        //The radial line function
        if(this._options.plots.isArea === true) {
            baseRadar = radialArea()
                .curve(curveCardinalClosed)
                .angle((d,i)=> {	return i * angleSlice(); })
                .innerRadius(innerRadius)
                .outerRadius(innerRadius);

            easeRadar = radialArea()
                .curve(curveCardinalClosed)
                .angle((d,i)=> {	return i * angleSlice(); })
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
        } else {
            baseRadar = radialLine()
                .curve(curveLinearClosed)
                .radius(innerRadius)
                .angle((d,i)=> {	return i * angleSlice(); });

            easeRadar = radialLine()
                .curve(curveLinearClosed)
                .radius(outerRadius)
                .angle((d,i)=> {	return i * angleSlice(); });
        }


        if (this._options.plots.stackLayout === true) {
            if(this._options.plots.isArea) {
                radarLine = radialArea()
                    .curve(curveCardinalClosed)
                    .angle((d,i)=> {	return i * angleSlice(); })
                    .innerRadius( (d)=> {
                        return radiusScale(d.y0);
                    })
                    .outerRadius( (d)=> {
                        return radiusScale(d.y);
                    });
            } else {
                radarLine = radialLine()
                    .curve(curveLinearClosed)
                    .radius((d)=> { return radiusScale(d.y); })
                    .angle((d,i)=> {	return i * angleSlice(); });
            }
        } else {
            if(this._options.plots.isArea === true) {
                radarLine = radialArea()
                    .curve(curveCardinalClosed)
                    .angle((d,i)=> {	return i * angleSlice(); })
                    .innerRadius(innerRadius)
                    .outerRadius( (d)=> {
                        return radiusScale(this._getMetricVal(d));
                    });
            } else {
                radarLine = radialLine()
                    .curve(curveLinearClosed)
                    .radius((d)=> { return radiusScale(this._getMetricVal(d)); })
                    .angle((d,i)=> {	return i * angleSlice(); });
            }
        }



        metricScale(this._data.original, this._options);

        let minY = this._getMetric().ticksMin;
        let maxY = this._getMetric().ticksMax;
        let levels = this._getMetric().ticksTier + 1;

        if (this._options.plots.stackLayout === true) {
            if (this._options.plots.stackMethod === Stacks.Expand) {
                minY = 0;
                maxY = 1;
                levels = 5;
            } else {
                let _range = metricStackedScale(this._data.nested, this._options);

                minY = _range[0];
                maxY = _range[1];
                levels = _range[2] + 1;
            }
        }

        if (isNumber(this._options.plots.minValue)
            && isFinite(this._options.plots.minValue)) {
            minY = Math.min(this._options.plots.minValue, minY);
        }
        if (isNumber(this._options.plots.maxValue)
            && isFinite(this._options.plots.maxValue)) {
            maxY = Math.max(this._options.plots.maxValue, maxY);
        }

        if (isNumber(this._options.plots.levels)
            && isFinite(this._options.plots.levels)
            && parseInt(this._options.plots.levels) > 0) {
            levels = parseInt(this._options.plots.levels);
        }

        let precision = labelPrecision(maxY, minY, levels);
        let multiplier = precision == 0 ? 0 : Math.pow(10, precision);

        let gridArc = arc()
            .innerRadius( (d)=> {
                return (outerRadius - innerRadius) / levels * (d - 1) + innerRadius;
            })
            .outerRadius((d)=> {
                return (outerRadius - innerRadius) / levels * (d) + innerRadius;
            })
            .startAngle(0)
            .endAngle(2 * Math.PI);

        angleScale.domain([minY, maxY]);
        radiusScale.domain([minY, maxY]);

        let levelRange = range(1, levels + 1);

        //Draw the background circles
        let gridCircles = this.axisGrid.selectAll(".grid-circle")
            .data(levelRange);

        gridCircles
            .enter()
            .append("path")
            .attr("d", gridArc)
            .attr('class', 'grid-circle')
            .attr("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", this._options.plots.opacityCircles)
            .style("filter", "url(#glow)");

        gridCircles
            .transition('grid-update-transition')
            .duration(this._options.animation.duration.quickUpdate)
            .style("fill-opacity", this._options.plots.opacityCircles)
            .attr("d", gridArc);

        gridCircles.exit().remove();

        let axisRange = range(0, levels + 1);
        let labelScale = scaleLinear().domain(extent(axisRange)).range([minY, maxY]).nice();
        let gridLabels = this.axisGrid.selectAll(".axis-label")
            .data(axisRange);


        gridLabels.enter().append("text")
            .attr("class", "axis-label")
            .attr("x", 4)
            .attr("y", (d)=> {
                return -d * ((outerRadius - innerRadius) / levels) - innerRadius;
            })
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", '#737373')
            .text((d) => {
                return levels <= 1 ? labelScale(d) : precision == 0 ? Math.round(labelScale(d)) : (Math.round(labelScale(d) * multiplier) / multiplier).toFixed(precision)
            });


        gridLabels
            .transition('grid-update-transition')
            .duration(500)
            .attr("y", (d)=> {
                return -d * ((outerRadius - innerRadius) / levels) - innerRadius;
            })
            .text((d) => {
                return levels <= 1 ? labelScale(d) : precision == 0 ? Math.round(labelScale(d)) : (Math.round(labelScale(d) * multiplier) / multiplier).toFixed(precision)
            });
        gridLabels.exit().remove();

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        let axis = this.axisGrid.selectAll(".axis")
            .data(this._getDimension().values);


        axis.exit().remove();

        let axisAdded = axis.enter()
            .append("g")
            .attr("class", "axis");

        axisAdded
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i)=> {
                return radiusScale(maxY * 1.1) * Math.cos(angleSlice() * i - Math.PI / 2);
            })
            .attr("y2", (d, i)=> {
                return radiusScale(maxY * 1.1) * Math.sin(angleSlice() * i - Math.PI / 2);
            })
            .attr("class", "axis-line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        axisAdded.append("text")
            .attr("class", "axis-legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", (d, i)=> {
                return radiusScale(maxY * this._options.plots.labelFactor) * Math.cos(angleSlice() * i - Math.PI / 2);
            })
            .attr("y", (d, i)=> {
                return radiusScale(maxY * this._options.plots.labelFactor) * Math.sin(angleSlice() * i - Math.PI / 2);
            })
            .text((d)=> {
                return d
            });


        axis.select('.axis-line')
            .transition('axis-update-transition')
            .duration(1250)
            .attr("x2", (d, i)=> {
                return radiusScale(maxY * 1.1) * Math.cos(angleSlice() * i - Math.PI / 2);
            })
            .attr("y2", (d, i)=> {
                return radiusScale(maxY * 1.1) * Math.sin(angleSlice() * i - Math.PI / 2);
            });


        axis.select('.axis-legend')
            .transition('axis-update-transition')
            .duration(this._options.animation.duration.update)
            .attr("x", (d, i)=> {
                return radiusScale(maxY * this._options.plots.labelFactor) * Math.cos(angleSlice() * i - Math.PI / 2);
            })
            .attr("y", (d, i)=> {
                return radiusScale(maxY * this._options.plots.labelFactor) * Math.sin(angleSlice() * i - Math.PI / 2);
            })
            .text( (d)=> {
                return d
            });

        this._container.selectAll('.axis-legend')
            .call(wrapSVGText, this._options.plots.wrapWidth);


        //Create a wrapper for the blobs
        let blobWrapper_updated = this._svg.selectAll(".radar-wrapper")
            .data(this._data.nested);

        // removed
        let blobWrapper_Removed = blobWrapper_updated.exit();

        blobWrapper_Removed.select('.radar-area')
            .transition('ease-radar-transition')
            .duration(this._options.animation.duration.remove)
            .attr("d",  (d)=> {
                return easeRadar(d.values);
            })
            .style("fill-opacity", 0);

        blobWrapper_Removed.select('.radar-stroke')
            .transition('ease-radar-transition')
            .duration(this._options.animation.duration.remove)
            .attr("d", (d)=> {
                return easeRadar(d.values);
            })
            .style("stroke-opacity", 0);

        setTimeout(function () {
            blobWrapper_Removed.remove();
        }, 1500);


        // added
        let blobWrapperAdded = blobWrapper_updated
            .enter().append("g")
            .attr("class", "radar-wrapper");

        if (this._options.plots.isArea === true) {
            blobWrapperAdded
                .append("path")
                .attr("class", "radar-area")
                .attr("d", (d)=> {
                    return baseRadar(d.values);
                })
                .style("fill", (d)=> {
                    return this._color(d.key);
                })
                .style("fill-opacity", this._options.plots.opacityArea)
                .transition('circle-expand-transition')
                .duration(this._options.animation.duration.update)
                .delay( (d, i)=> {
                    return i * this._options.animation.duration.update / this._getDimension().values.length
                })
                .attr("d",  (d)=> {
                    return radarLine(d.values);
                });
        }


        blobWrapperAdded
            .append("path")
            .attr("class", "radar-stroke")
            .attr("d", (d, i)=> {
                return baseRadar(d.values);
            })
            .style("stroke-width", this._options.plots.strokeWidth + "px")
            .style("stroke", (d)=> {
                return this._color(d.key);
            })
            .style("fill", "none")
            .transition('circle-expand-transition')
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> {
                return i * this._options.animation.duration.update / this._getDimension().values.length
            })
            .attr("d",  (d)=> {
                return radarLine(d.values);
            })
            .style("filter", "url(#glow)");

        blobWrapperAdded.selectAll(".radar-circle")
            .data( (d)=> { return d.values; })
            .enter().append("circle")
            .attr("class", "radar-circle")
            .attr("r", this._options.plots.dotRadius)
            .attr("cx", circleCx)
            .attr("cy", circleCy)
            .style("fill", this._c)
            .style("fill-opacity", this._options.plots.showDots === true ? 0.8 : 0);

        // updated
        blobWrapper_updated.select('.radar-area')
            .transition('update-radar-transition')
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> {
                return i * this._options.animation.duration.update / this._getDimension().values.length
            })
            .style("fill-opacity", this._options.plots.opacityArea)
            .attr("d",  (d)=> {
                return radarLine(d.values);
            });

        blobWrapper_updated.select('.radar-stroke')
            .transition('update-radar-transition')
            .duration(this._options.animation.duration.update)
            .delay( (d, i)=> {
                return i * this._options.animation.duration.update / this._getDimension().values.length
            })
            .style("stroke-width", this._options.plots.strokeWidth + "px")
            .attr("d", (d)=> {
                return radarLine(d.values);
            });

        let radarCircles_updated = blobWrapper_updated.selectAll(".radar-circle")
            .data( (d)=> { return d.values; });

        radarCircles_updated
            .enter()
            .append("circle")
            .attr("class", "radar-circle")
            .attr("r", this._options.plots.dotRadius)
            .attr("cx", circleCx)
            .attr("cy", circleCy)
            .style("fill", this._c)
            .style("fill-opacity", this._options.plots.showDots === true ? 0.8 : 0);


        radarCircles_updated
            .transition('update-radar-transition')
            .duration(this._options.animation.duration.update)
            .attr("r", this._options.plots.dotRadius)
            .attr("cx", circleCx)
            .attr("cy", circleCy)
            .style("fill", this._c);

        radarCircles_updated.exit()
            .transition()
            .duration(this._options.animation.duration.quickUpdate)
            .style("fill-opacity", 0)
            .remove();


        if (this._options.plots.showDots === true) {
            this._container.selectAll(".radar-circle")
                .transition()
                .duration(this._options.animation.duration.quickUpdate)
                .style("fill-opacity", 0.8);
        }

        /////////////////////////////////////////////////////////
        //////// Append invisible circles for tooltip ///////////
        /////////////////////////////////////////////////////////

        //Wrapper for the invisible circles on top
        let blobCircleWrapper = this._svg.selectAll(".radar-circle-wrapper")
            .data(this._data.nested);

        // exit
        blobCircleWrapper.exit().remove();

        // added
        let blobCircleWrapper_Added = blobCircleWrapper
            .enter()
            .append("g")
            .attr("class", "radar-circle-wrapper");

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper_Added.selectAll(".radar-invisible-circle")
            .data( (d)=> { return d.values; })
            .enter()
            .append("circle")
            .attr("class", "radar-invisible-circle")
            .attr("r", this._options.plots.dotRadius * 4)
            .attr("cx", circleCx)
            .attr("cy", circleCy)
            .style("fill", "none")
            .style('stroke', this._c)
            .style('stroke-opacity', 0)
            .style('stroke-dasharray', '2, 2')
            .style("pointer-events", "all");

        // updated
        blobCircleWrapper
            .transition('update-radar-transition')
            .duration(this._options.animation.duration.update)
            .attr("r", this._options.plots.dotRadius * 4)
            .attr("cx", circleCx)
            .attr("cy", circleCy)
            .style('stroke', this._c);


        //-----------------------  tooltip ------------------------
        function circleMouseOver(d, i) {
            let newX =  parseFloat(select(this).attr('cx')) - 10;
            let newY =  parseFloat(select(this).attr('cy')) - 10;

            that._tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(that._getMetricVal(d))
                .transition().duration(200)
                .style('opacity', 1);

            that._svg.append("circle")
                .attr('id', 'outline-hover')
                .attr("r",  that._options.plots.stackLayout ? radiusScale(d.y) : radiusScale(that._getMetricVal(d)))
                .style("fill", "#CDCDCD")
                .style("stroke", "black")
                .style("stroke-width", "2px")
                .style('stroke-dasharray', '5, 5')
                .style("fill-opacity", 0);

            that._container.selectAll('.grid-circle')
                .transition()
                .duration(300)
                .style('fill-opacity', 0)
                .style('stroke-opacity', 0);

            that._container.selectAll(".radar-area")
                .transition().duration(200)
                .style("fill-opacity", 0.1);

            that._container.selectAll(".radar-stroke")
                .transition().duration(200)
                .style('stroke-opacity', 0);

            that._container.selectAll(".radar-circle")
                .transition().duration(200)
                .style('fill-opacity', 0);

            if (!that._options.plots.showDots === true) {
                select(this)
                    .transition()
                    .duration(200)
                    .style('stroke-opacity', 1);
            }
        }

        function circleMouseOut(d, i) {
            that._tooltip.transition().duration(200)
                .style("opacity", 0);

            that._svg.select('#outline-hover').remove();

            that._container.selectAll('.grid-circle')
                .transition()
                .duration(300)
                .style('fill-opacity', that._options.plots.opacityCircles)
                .style('stroke-opacity', 1);

            that._container.selectAll(".radar-area")
                .transition().duration(200)
                .style("fill-opacity", that._options.plots.opacityArea);

            that._container.selectAll(".radar-stroke")
                .transition().duration(200)
                .style('stroke-opacity', 1);

            if (that._options.plots.showDots === true) {
                that._container.selectAll(".radar-circle")
                    .transition()
                    .duration(200)
                    .style('fill-opacity', 0.8);
            } else {
                select(this)
                    .transition()
                    .duration(200)
                    .style('stroke-opacity', 0);
            }
        }

        function blobMouseOver (d, i) {
            //Dim all blobs
            that._container.selectAll(".radar-area")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
            //Bring back the hovered over blob
            select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);
        }

        function blobMouseOut(d, i) {
            that._container.selectAll(".radar-area")
                .transition()
                .duration(200)
                .style("fill-opacity", that._options.plots.opacityArea);
        }


        function enableInteractions () {
            setTimeout(function(){
                that._container.selectAll('.radar-area')
                    .on('mouseover', blobMouseOver)
                    .on('mouseout', blobMouseOut);

                that._container.selectAll('.radar-invisible-circle')
                    .on("mouseover", circleMouseOver)
                    .on("mouseout", circleMouseOut);

            }, 2000);

        }

        enableInteractions();

    }


    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this._container.selectAll('.radar-area')
            .transition()
            .duration(this._options.animation.duration.update)
            .delay( (d, i)=> {
                return i * 150
            })
            .style("fill", (d, i)=> {
                return this._color(d.key);
            });

        this._container.selectAll('.radar-stroke')
            .transition()
            .duration(this._options.animation.duration.update)
            .delay( (d, i)=> { return i * 150 })
            .style("stroke", (d)=> {
                return this._color(d.key);
            });

        this._container.selectAll('.radar-circle')
            .transition()
            .duration(this._options.animation.duration.update)
            .delay( (d, i)=> { return i * 10 })
            .style("fill", this._c);
    };

    stackLayout() {
        this._options.plots.stackLayout = true;
        this._options.plots.stackMethod = Stacks.Zero;

        this.update();
    };

    expandLayout() {
        this._options.plots.stackLayout = true;
        this._options.plots.stackMethod = Stacks.Expand;

        this.update();
    };

    groupedLayout() {
        this._options.plots.stackLayout = false;

        this.update();
    };
}

export default Corona;