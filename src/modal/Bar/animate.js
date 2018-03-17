import { mouse } from 'd3-selection';
import { transition } from 'd3-transition';
import drawHiddenRects from './draw-hidden-rects';
import hasNegativeValue from '../../util/has-negative';
import { transition } from 'd3-transition';
import drawRects from './draw-rects';

const animate = state => {
  const {
    _data,
    _options,
    _frontContext,
    _detachedContainer,
    _y,
    _c,
    _x,
    _getDimensionVal,
    _getMetricVal,
  } = state;
  const _hasNegative = hasNegativeValue(_data, _options);

  const drawCanvasInTransition = () => {
    return t => {
      drawRects(_frontContext, _detachedContainer.selectAll('.bar'), _options);
    };
  };

  const dataUpdate = _detachedContainer.selectAll('.bar').data(_data);
  const dataJoin = dataUpdate.enter();
  const dataRemove = dataUpdate.exit();

  const exitTransition = transition()
    .duration(_options.animation.duration.remove)
    .each(() => {
      dataRemove
        .transition()
        .attr('y', _hasNegative ? _y(0) : _options.chart.innerHeight)
        .attr('height', 0)
        .tween('remove.rects', drawCanvasInTransition);

      dataRemove.remove();
    });

  const updateTransition = exitTransition
    .transition()
    .duration(_options.animation.duration.update)
    .each(() => {
      dataUpdate
        .attr('dimension', _getDimensionVal())
        .attr('metric', _getMetricVal())
        .transition('update-rect-transition')
        .delay(
          (d, i) => i / this._data.length * _options.animation.duration.update
        )
        .attr('fill', this._c)
        .attr('x', this._x)
        .attr('width', this._w)
        .attr('y', d => (this._getMetricVal(d) > 0 ? _y(d) : this._zero()))
        .attr(
          'height',
          d => (_hasNegative ? Math.abs(_y(d) - this._zero()) : this._h(d))
        )
        .tween('update.rects', drawCanvasInTransition);
    });

  const enterTransition = updateTransition
    .transition()
    .duration(_options.animation.duration.add)
    .each(() => {
      dataJoin
        .append('rect')
        .attr('class', 'bar')
        .attr('fill', _c)
        .attr('opacity', 1)
        .attr('x', _x)
        .attr('width', this._w)
        .attr('dimension', this._getDimensionVal)
        .attr('metric', this._getMetricVal)
        .attr('y', _hasNegative ? this._zero(0) : _options.chart.innerHeight)
        .attr('height', 0)
        .transition()
        .duration(_options.animation.duration.add)
        .delay(
          (d, i) => i / this._data.length * _options.animation.duration.add
        )
        .attr('y', d => (this._getMetricVal(d) > 0 ? this._y(d) : this._zero()))
        .attr(
          'height',
          d => (_hasNegative ? Math.abs(this._y(d) - this._zero()) : this._h(d))
        )
        .tween('append.rects', drawCanvasInTransition);
    });

  const that = this;
  enterTransition.on('end', () => {
    const colorMap = drawHiddenRects(
      this._hiddenContext,
      this._detachedContainer.selectAll('.bar')
    );

    // shadow color?
    /**
     * callback for when the mouse moves across the overlay
     */
    function mouseMoveHandler() {
      // get the current mouse position
      const [mx, my] = mouse(this);
      // This will return that pixel's color
      const col = that._hiddenContext.getImageData(
        mx * that._canvasScale,
        my * that._canvasScale,
        1,
        1
      ).data;
      //Our map uses these rgb strings as keys to nodes.
      const colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
      const node = colorMap.get(colString);

      if (node) {
        that._tooltip
          .html(that.tooltip(node))
          .transition()
          .duration(that._options.animation.tooltip)
          .style('left', mx + that._options.tooltip.offset[0] + 'px')
          .style('top', my + that._options.tooltip.offset[1] + 'px')
          .style('opacity', 1);
      } else {
        that._tooltip
          .transition()
          .duration(that._options.animation.tooltip)
          .style('opacity', 0);
      }
    }

    function mouseOutHandler() {
      that._tooltip
        .transition()
        .duration(that._options.animation.tooltip)
        .style('opacity', 0);
    }

    that._frontCanvas.on('mousemove', mouseMoveHandler);
    that._frontCanvas.on('mouseout', mouseOutHandler);
    that._listeners.call('rendered');
  });
};

export default animate;
