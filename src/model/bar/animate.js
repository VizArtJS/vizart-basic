import { mouse, select } from 'd3-selection';
import { transition } from 'd3-transition';
import drawRects from './draw-rects';
import drawHiddenRects from './draw-hidden-rects';

import hasNegativeValue from '../../util/has-negative';

import {
  y,
  c,
  x,
  getDimensionVal,
  getMetricVal,
  getDimension,
  getMetric,
} from '../../helper/withCartesian';
import isFunction from '../../util/isFunction';
import tooltipMarkup from '../../tooltip/markup';

const animate = state => {
  const {
    _data,
    _options,
    _frontContext,
    _detachedContainer,
    _containerId,
    _hiddenContext,
    _canvasScale,
  } = state;

  const _y = y(state);
  const _c = c(state);
  const _x = x(state);

  const _hasNegative = hasNegativeValue(_data, _options);
  const _getDimensionVal = getDimensionVal(state);
  const _getMetricVal = getMetricVal(state);

  const _w = () => {
    if (
      getDimension(state).scale.bandwidth === undefined ||
      !isFunction(getDimension(state).scale.bandwidth)
    ) {
      const evenWidth = Math.ceil(_options.chart.innerWidth / _data.length);

      return evenWidth > 1 ? evenWidth - 1 : 0.1;
    } else {
      return getDimension(state).scale.bandwidth();
    }
  };
  const _h = d => _options.chart.innerHeight - _y(d);
  const _zero = () => getMetric(state).scale(0);

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
        .attr('dimension', _getDimensionVal)
        .attr('metric', _getMetricVal)
        .transition('update-rect-transition')
        .delay(
          (d, i) => (i / _data.length) * _options.animation.duration.update
        )
        .attr('fill', _c)
        .attr('x', _x)
        .attr('width', _w)
        .attr('y', d => (_getMetricVal(d) > 0 ? _y(d) : _zero()))
        .attr('height', d => (_hasNegative ? Math.abs(_y(d) - _zero()) : _h(d)))
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
        .attr('width', _w)
        .attr('dimension', _getDimensionVal)
        .attr('metric', _getMetricVal)
        .attr('y', _hasNegative ? _zero(0) : _options.chart.innerHeight)
        .attr('height', 0)
        .transition()
        .duration(_options.animation.duration.add)
        .delay((d, i) => (i / _data.length) * _options.animation.duration.add)
        .attr('y', d => (_getMetricVal(d) > 0 ? _y(d) : _zero()))
        .attr('height', d => (_hasNegative ? Math.abs(_y(d) - _zero()) : _h(d)))
        .tween('append.rects', drawCanvasInTransition);
    });

  const tooltip = select(_containerId)
    .selectAll('.vizart-tooltip')
    .data([1])
    .enter()
    .append('div')
    .attr('class', 'vizart-tooltip')
    .style('opacity', 0);

  enterTransition.on('end', () => {
    const colorMap = drawHiddenRects(
      _hiddenContext,
      _detachedContainer.selectAll('.bar')
    );

    // shadow color?
    /**
     * callback for when the mouse moves across the overlay
     */
    function mouseMoveHandler() {
      // get the current mouse position
      const [mx, my] = mouse(this);
      // This will return that pixel's color
      const col = _hiddenContext.getImageData(
        mx * _canvasScale,
        my * _canvasScale,
        1,
        1
      ).data;
      //Our map uses these rgb strings as keys to nodes.
      const colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
      const node = colorMap.get(colString);

      if (node) {
        tooltip
          .html(tooltipMarkup(node, state))
          .transition()
          .duration(_options.animation.duration.tooltip)
          .style('left', mx + _options.tooltip.offset[0] + 'px')
          .style('top', my + _options.tooltip.offset[1] + 'px')
          .style('opacity', 1);
      } else {
        tooltip
          .transition()
          .duration(_options.animation.duration.tooltip)
          .style('opacity', 0);
      }
    }

    function mouseOutHandler() {
      tooltip
        .transition()
        .duration(_options.animation.duration.tooltip)
        .style('opacity', 0);
    }

    state._frontCanvas.on('mousemove', mouseMoveHandler);
    state._frontCanvas.on('mouseout', mouseOutHandler);
    state._listeners.call('rendered');
  });
};

export default animate;
