import { voronoi } from 'd3-voronoi';
import drawCell from './draw-cell';

const applyVoronoi = (context, width, height, opt, finalState)=> {
    const voronoiDiagram = voronoi()
        .x(d=> d.x)
        .y(d=> d.y)
        .extent([[-1, -1],
            [opt.chart.width + 1, opt.chart.height + 1]]);

    const diagram = voronoiDiagram(finalState);
    const links = diagram.links();
    const polygons = diagram.polygons();

    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = "#1f97e7";
    for (let p of polygons) {
        drawCell(context, p);
    }
    context.stroke();
    context.closePath();

    return voronoiDiagram;
}

export default applyVoronoi