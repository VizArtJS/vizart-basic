import { mouse, select } from 'd3-selection';
import { sum } from 'd3-array';

import limitSliceValues from './limit-slice-values';
import animateStates from './tween-states';
import drawHiddenCanvas from './draw-hidden-canvas';
import tooltipMarkup from '../../tooltip/markup';

import {
  y,
  c,
  getDimension,
  getMetric,
  getDimensionVal,
  getMetricVal,
} from '../../helper/withCartesian';

import isArray from '../../util/isArray';

const animate = state => {
  const {
    _data,
    _animationState,
    _frontContext,
    _options,
    _hiddenContext,
    _canvasScale,
    _containerId,
    _color,
  } = state;

  getMetric(state).scale.range(
    getMetric(state)
      .scale.range()
      .reverse()
  );

  const _y = y(state);
  const _c = c(state);
  const _getDimensionVal = getDimensionVal(state);
  const _getMetricVal = getMetricVal(state);

  const initialState = _animationState
    ? _animationState
    : _data.map(d => {
        return {
          y: 0,
          c: _c(d),
          alpha: 0,
          data: d,
          p: '0%',
          label: _getDimensionVal(d),
        };
      });

  const finalState = _data.map(d => {
    return {
      y: _y(d),
      c: _c(d),
      alpha: _options.plots.opacity,
      data: d,
      label: _getDimensionVal(d),
      p: '',
    };
  });

  // cache finalState as the initial state of next animation call
  state._animationState = finalState;

  const transformedInitial = limitSliceValues(initialState, _options, _color);
  const transformedFinal = limitSliceValues(finalState, _options, _color);

  const tooltip = select(_containerId)
    .selectAll('.vizart-tooltip')
    .data([1])
    .enter()
    .append('div')
    .attr('class', 'vizart-tooltip')
    .style('opacity', 0);

  animateStates(
    transformedInitial,
    transformedFinal,
    _options.animation.duration.update,
    _frontContext,
    _options
  ).then(res => {
    const colorMap = drawHiddenCanvas(_hiddenContext, res, _options, state);
    /**
     * callback for when the mouse moves across the overlay
     */
    function mouseMoveHandler() {
      // get the current mouse position
      const [mx, my] = mouse(this);
      const col = _hiddenContext.getImageData(
        mx * _canvasScale,
        my * _canvasScale,
        1,
        1
      ).data;
      const colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
      const node = colorMap.get(colString);

      if (node) {
        let html;
        if (isArray(node.data.data)) {
          let n = {};
          n[getDimension(state).accessor] = node.data.label;
          n[getMetric(state).accessor] = sum(
            node.data.data.map(d => d.data),
            _getMetricVal
          );
          html = tooltipMarkup(n, state);
        } else {
          html = tooltipMarkup(node.data.data, state);
        }

        tooltip
          .html(html)
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
