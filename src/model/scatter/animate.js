import { mouse, select } from 'd3-selection';
import { applyVoronoi } from 'vizart-core';

import animateStates from './tween-states';
import drawCanvas from './draw-canvas';
import highlightNode from './highlight-node';
import updateRadiusScale from './update-radius-scale';
import { c, x, y } from '../../helper/withCartesian';
import tooltipMarkup from '../../tooltip/markup';

const animate = state => {
  const {
    _data,
    _options,
    _frontContext,
    _containerId,
    _frontCanvas,
    _animationState,
  } = state;

  const _y = y(state);
  const _c = c(state);
  const _x = x(state);

  const _getRadius = () => state._options.data.r;
  const _getRadiusValue = d => d[_getRadius().accessor];
  const _r = d =>
    _getRadius().scale === null
      ? _options.r.default
      : _getRadius().scale(_getRadiusValue(d));

  updateRadiusScale(state);

  const initialState = _animationState
    ? _animationState
    : _data.map((d, i) => {
        return {
          id: i,
          x: _x(d),
          y: _frontCanvas.node().height,
          r: _r(d),
          c: _c(d),
          alpha: 0,
          data: d,
        };
      });

  const finalState = _data.map((d, i) => {
    return {
      id: i,
      x: _x(d),
      y: _y(d),
      r: _r(d),
      c: _c(d),
      alpha: _options.plots.opacity,
      data: d,
    };
  });

  // cache finalState as the initial state of next animation call
  state._animationState = finalState;

  const tooltip = select(_containerId)
    .selectAll('.vizart-tooltip')
    .data([1])
    .enter()
    .append('div')
    .attr('class', 'vizart-tooltip')
    .style('opacity', 0);

  animateStates(
    initialState,
    finalState,
    _options.animation.duration.update,
    _frontContext,
    _options
  ).then(res => {
    state._voronoi = applyVoronoi(_frontContext, _options, res);

    /**
     * callback for when the mouse moves across the overlay
     */
    function mouseMoveHandler() {
      // get the current mouse position
      const [mx, my] = mouse(this);
      const QuadtreeRadius = 100;
      // use the new diagram.find() function to find the Voronoi site
      // closest to the mouse, limited by max distance voronoiRadius
      const closest = state._voronoi.find(mx, my, QuadtreeRadius);

      if (closest) {
        tooltip
          .html(tooltipMarkup(closest.data.data, state))
          .transition()
          .duration(_options.animation.duration.tooltip)
          .style('left', mx + _options.tooltip.offset[0] + 'px')
          .style('top', my + _options.tooltip.offset[1] + 'px')
          .style('opacity', 1);

        drawCanvas(_frontContext, finalState);
        highlightNode(_frontContext, closest.data);
      } else {
        tooltip
          .transition()
          .duration(_options.animation.duration.tooltip)
          .style('opacity', 0);

        drawCanvas(_frontContext, finalState);
      }
    }

    function mouseOutHandler() {
      tooltip
        .transition()
        .duration(_options.animation.duration.tooltip)
        .style('opacity', 0);

      drawCanvas(_frontContext, finalState);
    }

    state._frontCanvas.on('mousemove', mouseMoveHandler);
    state._frontCanvas.on('mouseout', mouseOutHandler);

    state._listeners.call('rendered');
  });
};
export default animate;
