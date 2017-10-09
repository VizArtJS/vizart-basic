import drawCircularText from '../../canvas/helper/draw-circular-text';
import getAxisLabel from './get-axis-label';
import isFunction from 'lodash-es/isFunction';

const getLevelLabel = (opt, label)=> (opt.plots.levelLabel && isFunction(opt.plots.levelLabel))
    ? opt.plots.levelLabel(label)
    : label;


const highlight = (context, opt, datum)=> {
    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    context.beginPath();
    context.setLineDash([5, 5]);
    context.strokeStyle = opt.plots.highlightStrokeColor;

    context.arc(0, 0, datum.d.r, 0, 2 * Math.PI, false);

    context.stroke();
    context.restore();
    context.closePath();

    context.save();
    context.beginPath();
    context.fillStyle = opt.plots.highlightNodeColor ? opt.plots.highlightNodeColor : datum.c;
    context.strokeStyle = 'white';
    context.lineWidth = 3;
    context.arc(datum.x, datum.y, 6, 2 * Math.PI, false);
    context.fill();
    context.stroke();

    context.closePath();

    context.restore();

    context.save();
    context.beginPath();
    context.fillStyle = opt.plots.axisLabelColor;
    drawCircularText(context,
        getAxisLabel(opt, datum.label, 1) + '',
        14,
        'Oswald',
        opt.plots.highlightLabelColor,
        opt.chart.width / 2,
        opt.chart.height / 2,
        datum.d.r + 10,
        datum.d.angle, 5);

    context.restore();

    const lineOffset = 8;
    context.save();
    context.beginPath();
    context.textBaseline = 'alphabetic';
    context.textAlign = 'center'; // Ensure we draw in exact center
    context.fillStyle = opt.plots.highlightLabelColor;
    context.fillText(getLevelLabel(opt, datum.metric), opt.chart.width / 2, opt.chart.height / 2 - lineOffset);
    context.fillText(datum.s, opt.chart.width / 2, opt.chart.height / 2 + lineOffset);
    context.restore();

}

export default highlight;