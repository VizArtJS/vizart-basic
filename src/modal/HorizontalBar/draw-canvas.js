import { select } from 'd3-selection';

import drawHorizontalLabel from './draw-horizontal-label';
import drawMetricOntTop from './draw-metric-on-top';

const drawCanvas =  (context, selection, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    selection.each(function(d){
        context.save();

        const node = select(this);
        context.beginPath();
        context.fillStyle = node.attr('fill');
        context.globalAlpha = node.attr('opacity');
        context.rect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'));
        context.fill();

        context.restore();

        drawHorizontalLabel(context, node, opt);
        // if (opt.plots.metricLabel.enabled === true) drawMetricOntTop(context, node, opt);
    });
}

export default drawCanvas;