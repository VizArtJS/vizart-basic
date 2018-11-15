import animateStates from './tween-states';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { mouse, select } from 'd3-selection';
import drawPetal from './draw-petal';
import { arc } from 'd3-shape';
import drawHiddenCanvas from './draw-hidden-canvas';
import getRadius from './get-radius';
import getOrderedDimensions from './get-ordered-dimensions';

import { getDimension, getDimensionVal } from '../../helper/withCartesian';
import tooltipMarkup from '../../tooltip/markup';

const animate = state => {
  const {
    _data,
    _color,
    _options,
    _frontContext,
    _detachedContainer,
    _containerId,
    _hiddenContext,
    _canvasScale,
    _animationState,
  } = state;

  const _getDimensionVal = getDimensionVal(state);

  const colorScale = scaleOrdinal().range(_color.range());
  const c = d => colorScale(d);
  const innerRadius = getRadius(_options)[0];
  const outerRadius = getRadius(_options)[1];

  // y is area
  // https://understandinguncertainty.org/node/214
  const area = r => Math.PI * Math.pow(r, 2) / 3;
  const radiusOfArea = area => Math.sqrt(area * 3 / Math.PI);

  const radiusScale = scaleLinear()
    .domain([0, radiusOfArea(_data.maxY)])
    .range([innerRadius, outerRadius]);

  const r = d => radiusScale(radiusOfArea(d));

  const sliceNum = getDimension(state).values.length;
  const angleScale = scaleLinear()
    .domain([0, sliceNum])
    .range([0, 2 * Math.PI]);

  const dimensions = getOrderedDimensions(_options, getDimension(state).values);
  const finalState = dimensions.map((d, i) => {
    const array = _data.nested.map(e => {
      return {
        key: e.key,
        s: e.key,
        c: _options.data.y.length > 1 ? c(e.key) : c(d),
        alpha: _options.plots.opacity,
        startAngle: angleScale(i),
        endAngle: angleScale(i + 1),
        r0: innerRadius,
        r: r(e.values[i]._y),
        data: e.values[i],
      };
    });

    // larger slice are drawn first
    array.sort((a, b) => b.r - a.r);

    return {
      dimension: d,
      i: i,
      slice: array,
    };
  });

  select(_containerId)
    .selectAll('.vizart-tooltip')
    .data([1])
    .enter()
    .append('div')
    .attr('class', 'vizart-tooltip')
    .style('opacity', 0);

  const tooltip = select(_containerId).select('.vizart-tooltip');

  const enableMouse = () => {
    const colorMap = drawHiddenCanvas(_hiddenContext, finalState, _options);

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
        const html = tooltipMarkup(node.data.data, state);

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
  };

  if (!_animationState && finalState.length < 30) {
    const drawCanvasInTransition = function(d, i) {
      return t => {
        drawPetal(
          _frontContext,
          _detachedContainer.selectAll('.petal-group'),
          _options,
          sliceNum
        );
      };
    };

    _detachedContainer.attr(
      'transform',
      'translate(' +
        (_options.chart.margin.left + _options.chart.innerWidth / 2) +
        ',' +
        (_options.chart.margin.top + _options.chart.innerHeight / 2) +
        ')'
    );

    const dataUpdate = _detachedContainer
      .selectAll('.petal-group')
      .data(finalState);
    const dataJoin = dataUpdate.enter();

    const arcDiagram = arc()
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .innerRadius(d => d.r0)
      .outerRadius(d => d.r)
      .padAngle(0.04);

    const groups = dataJoin
      .append('g')
      .attr('class', 'petal-group')
      .attr('scale', 0)
      .attr('transform', 'scale(0,0)');

    groups
      .selectAll('.petal')
      .data(d => d.slice)
      .enter()
      .append('path')
      .attr('class', 'petal')
      .attr('series', d => d.s)
      .attr('dimension', d => _getDimensionVal(d.data.data))
      .attr('r', d => d.r)
      .attr('d', arcDiagram)
      .attr('fill', d => d.c)
      .attr('opacity', d => d.alpha);

    groups
      .transition()
      .delay(500)
      .duration((d, i) => 150 * i)
      .attr('scale', 1)
      .attr('transform', 'scale(1,1)')
      .tween('blooming.petal', drawCanvasInTransition)
      .on('end', () => {
        enableMouse();
      });
  } else {
    animateStates(
      _animationState,
      finalState,
      _options.animation.duration.update,
      _frontContext,
      _options
    ).then(res => {
      enableMouse();
    });
  }

  state._animationState = finalState;
};

export default animate;
