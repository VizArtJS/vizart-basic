import { getTransparentColor } from 'vizart-core';

const highlightNode = (context, opt, datum, x, y)=> {
    context.save();

    context.save();
    context.beginPath();
    context.fillStyle = opt.plots.highlightNodeColor ? opt.plots.highlightNodeColor : getTransparentColor(datum.c, 0.7);
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.arc(x, y, 6, 2 * Math.PI, false);
    context.fill();
    context.stroke();

    context.closePath();

    context.restore();
}

export default highlightNode;