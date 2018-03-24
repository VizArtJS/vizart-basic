import animateStates from './tween-states';
import { mouse, select } from 'd3-selection';
import { applyVoronoi } from 'vizart-core';

import highlightNode from './highlight-node';
import drawCanvas from './draw-canvas';
import highlightArea from './highlight-area';
import { c, y0, y1 } from '../../helper/withStacked';
import { x, getMetric } from '../../helper/withCartesian';
import tooltipMarkup from '../../tooltip/markup';

const animate = state => {
  const {
    _animationState,
    _data,
    _options,
    _frontContext,
    _containerId,
  } = state;

  const _x = x(state);
  const _c = c(state);
  const _y0 = y0(state);
  const _y1 = y1(state);

  const initialState = _animationState
    ? _animationState
    : _data.nested.map(d => ({
        key: d.key,
        c: _c(d),
        alpha: 0,
        values: d.values.map(e => {
          return {
            key: d.key,
            c: _c(d),
            x: _x(e.data),
            y: _options.chart.innerHeight,
            y0: _y0(e),
            y1: _y1(e),
            data: e.data,
          };
        }),
      }));

  const finalState = _data.nested.map(d => ({
    key: d.key,
    c: _c(d),
    alpha: _options.plots.opacityArea,
    values: d.values.map(e => {
      return {
        key: d.key,
        c: _c(d),
        x: _x(e.data),
        y: e.y,
        y0: _y0(e),
        y1: _y1(e),
        data: e.data,
      };
    }),
  }));

  // cache finalState as the initial state of next animation call
  state._animationState = finalState;

  select(_containerId)
    .selectAll('.vizart-tooltip')
    .data([1])
    .enter()
    .append('div')
    .attr('class', 'vizart-tooltip')
    .style('opacity', 0);

  const tooltip = select(_containerId).select('.vizart-tooltip');

  animateStates(
    initialState,
    finalState,
    _options.animation.duration.update,
    _frontContext,
    _options
  ).then(res => {
    state._voronoi = applyVoronoi(
      _frontContext,
      _options,
      res.reduce((acc, p) => {
        acc = acc.concat(p.values);
        return acc;
      }, [])
    );

    /**
     * callback for when the mouse moves across the overlay
     */
    function mouseMoveHandler() {
      // get the current mouse position
      const [mx, my] = mouse(this);
      const QuadtreeRadius = 40;
      // use the new diagram.find() function to find the Voronoi site
      // closest to the mouse, limited by max distance voronoiRadius
      const closest = state._voronoi.find(mx, my, QuadtreeRadius);

      if (closest) {
        closest.data.data[getMetric(state).accessor] =
          closest.data.data[closest.data.key];

        tooltip
          .html(tooltipMarkup(closest.data.data, state))
          .transition()
          .duration(_options.animation.duration.tooltip)
          .style('left', mx + _options.tooltip.offset[0] + 'px')
          .style('top', my + _options.tooltip.offset[1] + 'px')
          .style('opacity', 1);

        highlightArea(_frontContext, res, _options, closest.data);
        highlightNode(
          _frontContext,
          _options,
          closest.data.c,
          closest[0],
          closest[1]
        );
      } else {
        drawCanvas(_frontContext, res, _options);

        tooltip
          .transition()
          .duration(_options.animation.duration.tooltip)
          .style('opacity', 0);
      }
    }

    function mouseOutHandler() {
      drawCanvas(_frontContext, res, _options);

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
