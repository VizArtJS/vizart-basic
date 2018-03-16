import { mouse } from 'd3-selection';
import {
  linearStops,
  applyVoronoi,
  apiRenderCanvas,
  apiUpdate,
  canvas,
  genericColor,
} from 'vizart-core';
import { x, y } from '../../helper/withCartesian';
import tooltipMarkup from '../../tooltip/markup';
import { renderAxis, updateAxis } from '../../axis';
import { processCartesianData } from '../../data';

import createCartesianOpt from '../../options/createCartesianOpt';
import animateStates from './tween-states';
import drawCanvas from './draw-canvas';
import highlightNode from './highlight-node';

const AreaOpt = {
  chart: {
    type: 'area_horizontal',
  },
  plots: {
    areaOpacity: 0.3,
    curve: 'basis',
    strokeWidth: 2,
    highlightNodeColor: '#F03E1E',
    nodeRadius: 4,
    drawArea: true,
    showDots: false,
  },
};

const _animateArea = state => {
  const {
    _dataState: previousState,
    _data: data,
    _options: opt,
    _frontCanvas: frontCanvas,
    _frontContext: frontContext,
    _tooltip: tooltip,
    _listeners: listeners,
  } = state;

  const stops = linearStops(opt.color.scheme);
  const nodeColor = stops[stops.length - 1].color;

  const initialState = previousState
    ? previousState
    : data.map(d => {
        return {
          x: x(state)(d),
          y: frontCanvas.node().height,
          r: opt.plots.nodeRadius,
          c: nodeColor,
          alpha: 0,
          data: d,
        };
      });

  const finalState = data.map(d => {
    return {
      x: x(state)(d),
      y: y(state)(d),
      r: opt.plots.nodeRadius,
      c: nodeColor,
      alpha: 1,
      data: d,
    };
  });

  state._dataState = finalState;

  animateStates(
    initialState,
    finalState,
    opt.animation.duration.update,
    frontContext,
    opt
  ).then(res => {
    state._voronoi = applyVoronoi(frontContext, opt, res);

    // this._quadtree = applyQuadtree(ctx, opt, res);

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
          .style('left', mx + opt.tooltip.offset[0] + 'px')
          .style('top', my + opt.tooltip.offset[1] + 'px')
          .style('opacity', 1);

        drawCanvas(frontContext, res, opt, false);
        highlightNode(frontContext, opt, closest.data, closest[0], closest[1]);
      } else {
        tooltip
          .transition()
          .duration(opt.animation.tooltip)
          .style('opacity', 0);

        drawCanvas(frontContext, res, opt, false);
      }
    }

    function mouseOutHandler() {
      tooltip.style('opacity', 0);

      drawCanvas(frontContext, res, opt, false);
    }

    frontCanvas.on('mousemove', mouseMoveHandler);
    frontCanvas.on('mouseout', mouseOutHandler);

    listeners.call('rendered');
  });
};

const renderArea = state => ({
  render(data) {
    apiRenderCanvas(state).render(data);
    renderAxis(state);
    _animateArea(state);
  },
});

const updateArea = state => ({
  update() {
    apiUpdate(state).update();
    updateAxis(state);
    _animateArea(state);
  },
});

const makeComposers = ChartOpt => ({
  opt: opt => createCartesianOpt(ChartOpt, opt),
  data: processCartesianData,
  color: (colorOpt, data, opt) =>
    genericColor(colorOpt, data.map(d => d[opt.data.y[0].accessor])),
});

const abstractArea = ChartOpt => (id, opt) => {
  const baseChart = canvas(id, opt, makeComposers(ChartOpt));

  return Object.assign(
    {},
    baseChart,
    renderArea(baseChart),
    updateArea(baseChart)
  );
};

const area = abstractArea(AreaOpt);

export default area;

export { abstractArea };
