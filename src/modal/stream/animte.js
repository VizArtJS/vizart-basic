import { min } from 'd3-array';
import { mouse } from 'd3-selection';
import { applyVoronoi } from 'vizart-core';

import animateStates from './tween-states';
import drawCanvas from './draw-canvas';
import highlightNode from './highlight-node';
import { y0, y1, c } from '../../helper/withCartesianStacked';

import { x, getMetric } from '../../helper/withCartesian';
import tooltipMarkup from '../../tooltip/markup';

const animate = state => {
  const {
    _dataState: previousState,
    _data: data,
    _options: opt,
    _frontCanvas: frontCanvas,
    _frontContext: frontContext,
    _tooltip: tooltip,
    _listeners: listeners,
  } = state;

  const _x = x(state),
    _c = c(state),
    _y0 = y0(state),
    _y1 = y1(state);

  const minY0 = min(data.nested.map(d => min(d.values.map(e => e.y0))));
  getMetric(state).scale.domain([minY0, data.maxY]);

  const initialState = previousState
    ? previousState
    : data.nested.map(d => {
        return {
          key: d.key,
          c: _c(d),
          s: d.key,
          alpha: 0,
          values: d.values.map(e => {
            return {
              key: d.key,
              x: _x(e.data),
              y: e.y,
              y0: opt.chart.innerHeight / 2,
              y1: opt.chart.innerHeight / 2,
              data: e.data,
            };
          }),
        };
      });

  const finalState = data.nested.map(d => {
    return {
      key: d.key,
      c: _c(d),
      alpha: opt.plots.opacityArea,
      values: d.values.map(e => {
        return {
          key: d.key,
          x: _x(e.data),
          y: e.y,
          y0: _y0(e),
          y1: _y1(e),
          data: e.data,
        };
      }),
    };
  });

  // cache finalState as the initial state of next animation call
  state._dataState = finalState;

  animateStates(
    initialState,
    finalState,
    opt.animation.duration.update,
    frontContext,
    opt
  ).then(res => {
    state._voronoi = applyVoronoi(
      frontContext,
      opt,
      res.reduce((acc, p) => {
        acc = acc.concat(
          p.values.map(d => {
            let n = d;
            n.y = d.y1;
            return n;
          })
        );
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
        closest.data.data[state._getMetric().accessor] =
          closest.data.data[closest.data.key];
        tooltip
          .html(tooltipMarkup(closest.data.data, state))
          .transition()
          .duration(opt.animation.tooltip)
          .style('left', mx + opt.tooltip.offset[0] + 'px')
          .style('top', my + opt.tooltip.offset[1] + 'px')
          .style('opacity', 1);

        drawCanvas(frontCanvas, res, opt);
        highlightNode(frontCanvas, opt, closest.data.c, closest[0], closest[1]);
      } else {
        tooltip
          .transition()
          .duration(opt.animation.tooltip)
          .style('opacity', 0);
        drawCanvas(frontCanvas, res, opt);
      }
    }

    function mouseOutHandler() {
      tooltip
        .transition()
        .duration(opt.animation.tooltip)
        .style('opacity', 0);

      drawCanvas(frontCanvas, res, opt);
    }

    frontCanvas.on('mousemove', mouseMoveHandler);
    frontCanvas.on('mouseout', mouseOutHandler);

    listeners.call('rendered');
  });
};

export default animate;
