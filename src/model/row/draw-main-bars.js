import { scaleBand } from 'd3-scale';
import { transition } from 'd3-transition';
import { mouse, select } from 'd3-selection';
import { extent } from 'd3-array';

import drawHiddenRects from './draw-hidden-rects';
import drawCanvas from './draw-canvas';
import getMetricScale from './get-metric-scale';
import { getDimensionVal, getMetricVal } from '../../helper/withCartesian';
import tooltipMarkup from '../../tooltip/markup';

const drawMainBars = (state, data) => {
  const {
    _frontContext,
    _hiddenContext,
    _detachedContainer,
    _options,
    _color,
    _containerId,
    _canvasScale,
  } = state;
  const _getDimensionVal = getDimensionVal(state);
  const _getMetricVal = getMetricVal(state);

  const drawCanvasInTransition = () => {
    return t => {
      drawCanvas(_frontContext, _detachedContainer.selectAll('.bar'), _options);
    };
  };

  const xScale = scaleBand()
    .domain(data.map(d => _getDimensionVal(d)))
    .range([
      0,
      _options.chart.innerHeight - _options.plots.bottomAxisOffset - 5,
    ])
    .paddingInner(0.1);

  const yScale = getMetricScale(state, data);
  const mainWidth =
    _options.plots.enableMiniBar === true
      ? _options.chart.innerWidth - _options.plots.miniBarWidth
      : _options.chart.innerWidth;

  const h = xScale.bandwidth();
  const x = d => xScale(_getDimensionVal(d));
  let w;
  let y;
  const colorScale = _color.copy().domain(yScale.domain());

  const yExtent = extent(data, _getMetricVal);

  if (yExtent[0] >= 0) {
    w = d => yScale(_getMetricVal(d));
    y = d => yScale(0);

    if (_options.color.type === 'divergent') {
      colorScale.domain([-yScale.domain()[1], Math.abs(yScale.domain()[1])]);
    }
  } else if (yExtent[1] <= 0) {
    w = d => mainWidth - yScale(_getMetricVal(d));
    y = d => yScale(_getMetricVal(d));

    if (_options.color.type === 'divergent') {
      colorScale.domain([yScale.domain()[0], Math.abs(yScale.domain()[0])]);
    }
  } else {
    w = d => Math.abs(mainWidth / 2 - yScale(_getMetricVal(d)));
    y = d => (_getMetricVal(d) > 0 ? mainWidth / 2 : mainWidth / 2 - w(d));
  }

  const c = d => colorScale(_getMetricVal(d));

  const dataUpdate = _detachedContainer.selectAll('.bar').data(data);
  const dataJoin = dataUpdate.enter();
  const dataRemove = dataUpdate.exit();

  const exitTransition = transition()
    .duration(_options.animation.duration.remove)
    .each(() => {
      dataRemove
        .transition()
        .attr('width', 0)
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
        .delay((d, i) => (i / data.length) * _options.animation.duration.update)
        .attr('fill', c)
        .attr('x', y)
        .attr('width', w)
        .attr('y', x)
        .attr('height', h)
        .tween('update.rects', drawCanvasInTransition);
    });

  const enterTransition = updateTransition
    .transition()
    .duration(_options.animation.duration.update)
    .each(() => {
      dataJoin
        .append('rect')
        .attr('class', 'bar')
        .attr('fill', c)
        .attr('opacity', 1)
        .attr('x', y)
        .attr('y', x)
        .attr('width', 0)
        .attr('dimension', _getDimensionVal)
        .attr('metric', _getMetricVal)
        .attr('height', h)
        .transition()
        .delay((d, i) => (i / data.length) * _options.animation.duration.update)
        .attr('width', w)
        .tween('append.rects', drawCanvasInTransition);
    });

  select(_containerId)
    .selectAll('.vizart-tooltip')
    .data([1])
    .enter()
    .append('div')
    .attr('class', 'vizart-tooltip')
    .style('opacity', 0);

  const tooltip = select(_containerId).select('.vizart-tooltip');

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

export default drawMainBars;
