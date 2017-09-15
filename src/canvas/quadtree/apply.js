import { quadtree } from 'd3-quadtree';

const applyQuadtree = (context, opt, finalState)=> {
    return quadtree()
        .x(d=> d.x)
        .y(d=> d.y)
        .extent([[-1, -1],
            [context.canvas.width + 1, context.canvas.height + 1]])
        .addAll(finalState);
}

export default applyQuadtree;