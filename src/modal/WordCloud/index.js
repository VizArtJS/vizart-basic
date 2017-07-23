import { AbstractBasicCartesianChart } from '../../base';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { default as cloud } from 'd3-cloud';

import createCartesianOpt from '../../options/createCartesianOpt';


const SPIRAL = {
    ARCHIMEDIAN : 'archimedean',
    REECANGULAR :  'rectangular'
};

const DefaultOptions = {
    chart: {
        type: 'word_cloud',
        margin: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        }
    },

    plots: {
        padding: 5,
        rotates: 0,
        fontSizeMax: 100,
        fontSizeMin: 10,
        spiral: SPIRAL.REECANGULAR
    }
};

const TimeInterval = 10;

class WordCloud extends AbstractBasicCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    render(_data) {
        super.render(_data);

        this._svg.attr("transform", "translate(" + (this._options.chart.width / 2) + ","
            + (this._options.chart.height / 2) + ")");
        this._background = this._container.append('g');
        this._layout = cloud().timeInterval(TimeInterval);
        this._sizeScale = scaleLinear();
        this._f = (d)=> { return this._sizeScale(this._getMetricVal(d)); }

        this.update();
    }

    update(){
        super.update();

        this._sizeScale.domain(extent(this._data, (d)=> {
                return this._getMetricVal(d);
            }))
            .range([this._options.plots.fontSizeMin, this._options.plots.fontSizeMax]);


        this._layout
            .stop()
            .words(this._data)
            .padding(this._options.plots.padding)
            .spiral(this._options.plots.spiral)
            .size([this._options.chart.innerWidth, this._options.chart.innerHeight])
            .text(this.s_getDimensionVal)
            .rotate(this._options.plots.rotates)
            .fontSize(this._f)
            .on("end", ()=>{
                let dataUpdate = this._svg
                    .selectAll(".word")
                    .data(this._data);

                let dataJoin = dataUpdate.enter();

                dataUpdate
                    .transition()
                    .duration(this._options.animation.duration.quickUpdate)
                    .style("font-size", (d)=> { return this._f(d) + 'px'; })
                    .style("fill", this._c)
                    .attr("text-anchor", "middle")
                    .attr("transform",  (d)=> {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(this._getDimensionVal);


                dataJoin.append("text")
                    .attr('class', 'word')
                    .attr("text-anchor", "middle")
                    .attr("transform",  (d)=> {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .style("font-size", (d)=> {
                        return this._f(d) + 'px';
                    })
                    .style("fill", this._c)
                    .text(this._getDimensionVal);

                let shadowBG = this._background
                    .append("g")
                    .attr("transform", this._svg.attr("transform"));
                let shadowNode = shadowBG.node();
                dataUpdate.exit().each(function () {
                    shadowNode.appendChild(this)
                });

                shadowBG.transition()
                    .duration(this._options.animation.duration.update)
                    .style("opacity", 1e-6)
                    .remove();
            });

        this._layout.start();


    }

    transitionColor(colorOptions) {
        super.transitionColor(colorOptions);

        this._svg.selectAll('.word')
            .transition()
            .delay(1e3)
            .duration(this._options.animation.duration.color)
            .style('fill', this._c);
    };


    createOptions(_userOptions) {
        return createCartesianOpt(DefaultOptions, _userOptions);
    }

}


export default WordCloud;