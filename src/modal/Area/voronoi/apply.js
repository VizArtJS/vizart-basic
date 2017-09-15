import { voronoi } from 'd3-voronoi';
import drawCell from './draw-cell';

const applyVoronoi = (context, opt, finalState)=> {
    const voronoiDiagram = voronoi()
        .x(d=> d.x)
        .y(d=> d.y)
        .extent([[-1, -1],
            [context.canvas.width + 1, context.canvas.height + 1]]);

    return voronoiDiagram(finalState);
}

export default applyVoronoi