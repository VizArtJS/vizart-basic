import rotateXTicks from './rotete';

const transitionTicks = (svg, data, opt, xAxis, yAxis) => {
  const transition = svg.transition().duration(opt.animation.duration.update);
  const delay = (d, i) => i / data.length * opt.animation.duration.update;

  transition
    .select('.x.axis')
    .delay(delay)
    .call(xAxis);

  transition
    .select('.y.axis')
    .delay(delay)
    .call(yAxis);

  svg
    .select('.x.axis')
    .selectAll('.tick')
    .attr('opacity', opt.xAxis.showTicks === true ? 1 : 0);
  svg
    .select('.y.axis')
    .selectAll('.tick')
    .attr('opacity', opt.yAxis[0].showTicks === true ? 1 : 0);
  rotateXTicks(svg, opt.xAxis.labelAngle, false);
};

export default transitionTicks;
