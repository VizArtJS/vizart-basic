import rotateXTicks from './rotete';
import { transition } from 'd3-transition';

const transitionTicks = (svg, data, opt, xAxis, yAxis) => {
  const _transition = transition().duration(opt.animation.duration.update);
  const delay = (d, i) => (i / data.length) * opt.animation.duration.update;

  _transition
    .select('.x.axis')
    .delay(delay)
    .call(xAxis);

  _transition
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
