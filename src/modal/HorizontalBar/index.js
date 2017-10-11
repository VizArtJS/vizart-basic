import AbstractBasicCartesianChart from '../../base/AbstractBasicCartesianChart';
import createCartesianOpt from '../../options/createCartesianOpt';

const DefaultOpt = {
    chart: { type: 'bar_horizontal'},
    plots: {
        barLabel: {
            enabled: false,
            color: 'black'
        },
        metricLabel: {
            enabled: false,
            color: 'black',
            offset: 10
        }
    }
};

class HorizontalBar extends AbstractBasicCartesianChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._w = ()=>{
            if (isUndefined(this._getDimension().scale.bandwidth)
                || !isFunction(this._getDimension().scale.bandwidth)) {
                let evenWidth = Math.ceil(this._options.chart.innerWidth / this._data.length);

                return evenWidth > 1 ? evenWidth - 1 : 0.1
            } else {
                return this._getDimension().scale.bandwidth();
            }
        };
        this._h = d=>  this._options.chart.innerHeight - this._y(d);
        this._zero = ()=> this._getMetric().scale(0);

        // We also make a map/dictionary to keep track of colors associated with node.
        this.colToNode;
    }


    _animate() {
        const _hasNegative = hasNegativeValue(this._data, this._options);

        const drawCanvasInTransition = ()=> {
            return t=> {
                drawRects(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options);
            }};

        const dataUpdate = this._detachedContainer.selectAll('.bar').data(this._data);
        const dataJoin = dataUpdate.enter();
        const dataRemove = dataUpdate.exit();

        const exitTransition = transition()
            .duration(this._options.animation.duration.remove)
            .each(()=>{
                dataRemove
                    .transition()
                    .attr("y", _hasNegative ? this._y(0) : this._options.chart.innerHeight)
                    .attr("height", 0)
                    .tween("remove.rects", drawCanvasInTransition);

                dataRemove.remove();
            });

        const updateTransition = exitTransition.transition()
            .duration(this._options.animation.duration.update)
            .each(()=> {
                dataUpdate
                    .attr('dimension', this._getDimensionVal)
                    .attr('metric', this._getMetricVal)
                    .transition("update-rect-transition")
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.update)
                    .attr('fill', this._c)
                    .attr("x", this._x)
                    .attr('width', this._w)
                    .attr("y", d=> this._getMetricVal(d) > 0 ? this._y(d) : this._zero())
                    .attr("height", d=> _hasNegative
                        ? Math.abs( this._y(d) - this._zero() )
                        : this._h(d))
                    .tween("update.rects", drawCanvasInTransition);
            });

        const enterTransition = updateTransition.transition()
            .duration(this._options.animation.duration.add)
            .each(()=>{
                dataJoin.append("rect")
                    .attr('class', 'bar')
                    .attr('fill', this._c)
                    .attr('opacity', 1)
                    .attr("x", this._x)
                    .attr('width', this._w)
                    .attr('dimension', this._getDimensionVal)
                    .attr('metric', this._getMetricVal)
                    .attr("y", _hasNegative ? this._zero(0) : this._options.chart.innerHeight)
                    .attr("height", 0)
                    .transition()
                    .duration(this._options.animation.duration.add)
                    .delay((d, i) => i / this._data.length * this._options.animation.duration.add)
                    .attr("y", d=> this._getMetricVal(d) > 0 ? this._y(d) : this._zero())
                    .attr("height", d=> _hasNegative
                        ? Math.abs( this._y(d) - this._zero() )
                        : this._h(d))
                    .tween("append.rects", drawCanvasInTransition);
            });

        const that = this;
        enterTransition.on('end', ()=> {
            const colorMap = drawHiddenRects(this._hiddenContext, this._detachedContainer.selectAll('.bar'));

            // shadow color?
            /**
             * callback for when the mouse moves across the overlay
             */
            function mouseMoveHandler() {
                // get the current mouse position
                const [mx, my] = mouse(this);
                // This will return that pixel's color
                const col = that._hiddenContext.getImageData(mx * that._canvasScale, my * that._canvasScale, 1, 1).data;
                //Our map uses these rgb strings as keys to nodes.
                const colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
                const node = colorMap.get(colString);

                if (node) {
                    that._tooltip
                        .html(that.tooltip(node))
                        .transition()
                        .duration(that._options.animation.tooltip)
                        .style("left", mx + that._options.tooltip.offset[0] + "px")
                        .style("top", my + that._options.tooltip.offset[1] + "px")
                        .style("opacity", 1);
                } else {
                    that._tooltip
                        .transition()
                        .duration(that._options.animation.tooltip)
                        .style("opacity", 0);
                }
            }

            function mouseOutHandler() {
                that._tooltip
                    .transition()
                    .duration(that._options.animation.tooltip)
                    .style("opacity", 0);
            }

            that._frontCanvas.on('mousemove', mouseMoveHandler);
            that._frontCanvas.on('mouseout', mouseOutHandler);
            that._listeners.call('rendered');

        })
    }

    sortDetached() {
        this._detachedContainer
            .selectAll(".bar")
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i) => i / this._data.length * this._options.animation.duration.update)
            .attr("x", this._x);
    }

    sort(field, direction) {
        this._options.ordering = {
            accessor: field,
            direction: direction
        };

        this._data = super.data(this._data);
        sortSelector(this._detachedContainer.selectAll('.bar'), this._options);

        const drawCanvasInTransition = ()=> {
            return t=> {
                drawRects(this._frontContext, this._detachedContainer.selectAll('.bar'), this._options);
            }};

        this._detachedContainer.selectAll(".bar")
            .transition()
            .duration(this._options.animation.duration.update)
            .delay((d, i)=> i / this._data.length * this._options.animation.duration.update)
            .attr("x", this._x)
            .tween("append.rects", drawCanvasInTransition);

        this.axes.update(this._svg, this._data);
    }

    createOptions(_userOptions) {
        return createCartesianOpt(DefaultOpt, _userOptions);
    }
}

export default HorizontalBar;