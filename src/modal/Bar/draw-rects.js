import { select } from 'd3-selection';

import drawVerticalLabel from './draw-vertical-label';
import drawMetricOntTop from './draw-metric-on-top';

const drawRects =  (context, selection, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    selection.each(function(d){
        const node = select(this);
        context.beginPath();
        context.fillStyle = node.attr('fill');
        context.globalAlpha = node.attr('opacity');
        context.rect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'));
        context.fill();

        if (opt.plots.barLabel.enabled === true) drawVerticalLabel(context, node, opt);
        if (opt.plots.metricLabel.enabled === true) drawMetricOntTop(context, node, opt);
    });
}

export default drawRects;