import { color } from 'd3-color';

const highlightNode = (context, p)=> {
    context.save();
    context.beginPath();
    context.fillStyle = color(p.c).brighter().toString();
    context.globalAlpha = 1;
    context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
}

export default highlightNode;