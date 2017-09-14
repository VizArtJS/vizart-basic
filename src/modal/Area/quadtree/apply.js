import { quadtree } from 'd3-quadtree';
import flattenQuadtree from './flattern';

const applyQuadtree = (context, width, height, opt, finalState)=> {
    const quadData = quadtree()
        .x(d=> d.x)
        .y(d=> d.y)
        .extent([[-1, -1],
            [opt.chart.width + 1, opt.chart.height + 1]])
        .addAll(finalState);

    const rects = flattenQuadtree(quadData);

    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = "#ff5730";
    for (let r of rects) {
        context.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
    }

    context.stroke();
    context.closePath();

    return quadData;
}

export default applyQuadtree;