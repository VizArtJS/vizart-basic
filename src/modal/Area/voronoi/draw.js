import drawCell from './draw-cell';

const drawVoronoi = (context, diagram, color)=> {
    const polygons = diagram.polygons();

    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = color;
    for (let p of polygons) {
        drawCell(context, p);
    }
    context.stroke();
    context.closePath();
}

export default drawVoronoi;