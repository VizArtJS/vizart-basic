import { scaleBand, scaleLinear } from 'd3-scale';
import { event } from 'd3-selection';
import { extent } from 'd3-array';
import { brushY } from 'd3-brush';

import brushResizePath from '../../util/brush-handle';
import { getDimensionVal, getMetricVal } from '../../helper/withCartesian';

import drawMainBars from './draw-main-bars';
import updateMainAxis from './update-main-axis';

const miniWidth = opt => opt.chart.width - opt.plots.miniBarWidth;

const drawMiniSvg = state => {
  const { _options, _container, _data } = state;
  const _getDimensionVal = getDimensionVal(state);
  const _getMetricVal = getMetricVal(state);

  const width = _options.plots.miniBarWidth;
  const height = _options.chart.innerHeight;

  const miniX = miniWidth(_options);
  _container.select('.mini-group').remove();

  const miniSvg = _container
    .append('g')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'mini-group')
    .attr(
      'transform',
      'translate(' + miniX + ',' + _options.chart.margin.top + ')'
    );

  const miniXScale = scaleBand()
    .domain(_data.map(d => _getDimensionVal(d)))
    .range([
      0,
      _options.chart.innerHeight - _options.plots.bottomAxisOffset - 5,
    ])
    .paddingInner(0.1);
  const miniYScale = scaleLinear()
    .domain(extent(_data, _getMetricVal))
    .range([0, _options.plots.miniBarWidth]);

  const h = miniXScale.bandwidth();
  const y = d => miniYScale(_getMetricVal(d));
  const x = d => miniXScale(_getDimensionVal(d));

  const dataUpdate = miniSvg.selectAll('.mini').data(_data);
  const dataJoin = dataUpdate.enter();
  const dataRemove = dataUpdate.exit();

  dataRemove.remove();
  dataUpdate
    .attr('width', y)
    .attr('y', x)
    .attr('height', h);
  dataJoin
    .append('rect')
    .attr('class', 'mini')
    .attr('fill', '#e0e0e0')
    .attr('opacity', 1)
    .attr('x', 0)
    .attr('y', x)
    .attr('height', h)
    .attr('width', y);

  const brushGroup = miniSvg.append('g').attr('class', 'brush');

  const brush = brushY().extent([[0, 0], [miniX, _options.chart.innerHeight]]);

  const handleOffset =
    -_options.plots.miniBarWidth - _options.plots.miniBarWidth / 4;

  const handle = brushGroup
    .selectAll('.custom-handle')
    .data([{ type: 'w' }, { type: 'e' }])
    .enter()
    .append('path')
    .attr('class', 'custom-handle')
    .attr('stroke', '#000')
    .attr('stroke-width', 1)
    .attr('cursor', 'ns-resize')
    .attr('d', brushResizePath(_options.plots.miniBarWidth))
    .attr('transform', 'rotate(90) translate(0,' + handleOffset + ')');

  const brushMove = () => {
    const s = event.selection;

    if (s === null) {
      handle.attr('display', 'none');
    } else {
      handle
        .attr('display', null)
        .attr(
          'transform',
          (d, i) => 'rotate(90) translate(' + [s[i], handleOffset] + ')'
        );
    }

    miniSvg
      .selectAll('.mini')
      .attr('fill', d => {
        const metric = _getMetricVal(d);

        if (s[0] <= (d = x(d)) && d <= s[1]) {
          return metric > 0 ? '#addd8e' : '#fdbb84';
        } else {
          return '#e0e0e0';
        }
      })
      .classed('selected', d => s[0] <= (d = x(d)) && d <= s[1]);

    const data = miniSvg.selectAll('.selected').data();

    drawMainBars(state, data);
    updateMainAxis(state, data);
  };

  brush.on('start brush end', brushMove);

  brushGroup.call(brush);
  brushGroup.call(brush.move, [0, _options.plots.initialBrushHeight]);
};

export default drawMiniSvg;
