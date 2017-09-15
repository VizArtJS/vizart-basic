import flattenQuadtree from './flattern';

const drawQuadtree = (context, diagram, color)=> {
    const rects = flattenQuadtree(diagram);

    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = color;
    for (let r of rects) {
        context.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
    }

    context.stroke();
    context.closePath();
}

export default drawQuadtree;