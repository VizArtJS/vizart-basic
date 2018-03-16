import updateAxis from './update';
import rotateXTicks from './rotete';

const renderAxis = state => {
  const { _svg: svg, _options: opt } = state;
  const { x: _xAxis, y: _yAxis } = updateAxis(state);

  const xAxis = svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + opt.chart.innerHeight + ')')
    .call(_xAxis);

  const yAxis = svg
    .append('g')
    .attr('class', 'y axis')
    .call(_yAxis);

  if (opt.yAxis.length > 0 && opt.yAxis[0].title.text != null) {
    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - opt.chart.margin.left + opt.yAxis[0].title.offset)
      .attr('x', 0 - opt.chart.innerHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(opt.yAxis[0].title.text);
  }

  if (opt.xAxis.title.text != null) {
    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr(
        'transform',
        'translate(' +
          opt.chart.innerWidth / 2 +
          ' ,' +
          (opt.chart.innerHeight +
            opt.chart.margin.top +
            opt.xAxis.title.offset) +
          ')'
      )
      .style('text-anchor', 'middle')
      .text(opt.xAxis.title.text);
  }

  xAxis
    .selectAll('.tick')
    .attr('opacity', opt.xAxis.showTicks === true ? 1 : 0);
  yAxis
    .selectAll('.tick')
    .attr('opacity', opt.yAxis[0].showTicks === true ? 1 : 0);

  rotateXTicks(svg, opt.xAxis.labelAngle, false);
};

export default renderAxis;
