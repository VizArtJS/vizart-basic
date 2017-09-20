import {
    pie,
    arc
} from 'd3-shape';

import genColorByIndex from '../../canvas/generate-color';


const drawHiddenCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    const colorMap = new Map();

    const radius = Math.min(opt.chart.innerWidth, opt.chart.innerHeight) / 2;
    const arcDiagram = arc()
        .outerRadius(radius * 0.8)
        .innerRadius(() => opt.plots.isDonut ? radius * opt.plots.innerRadiusRatio : 0)
        .context(context);

    const pieDiagram = pie()
        .sort(null)
        .value(d=>d.y);

    const slices = pieDiagram(state);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    for (const [i, s] of slices.entries()) {
        context.beginPath();
        arcDiagram(s);
        const color = genColorByIndex(i + 1)
        context.fillStyle = color;
        context.fill();

        colorMap.set(color, s.data);
    }

    context.restore();

    return colorMap;
}

export default drawHiddenCanvas;