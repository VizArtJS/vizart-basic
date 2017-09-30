import {
    pie,
    arc
} from 'd3-shape';

import centroidOnArc from './centroid-on-arc';
import drawControlPoint from './draw-control-point';
import drawPolyLine from './draw-polyline-label';

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

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

    for (const s of slices) {
        context.beginPath();
        arcDiagram(s);
        context.fillStyle = s.data.c;
        context.fill();

        const outerArc = arc()
            .innerRadius(radius * 0.8)
            .outerRadius(radius * 0.8)
            .context(context);
        const centroid = centroidOnArc(outerArc, context, radius * 0.8, s);

        drawControlPoint(context, s, centroid, opt);
        drawPolyLine(context, s, centroid, opt);

    }
    context.restore();
}

export default drawCanvas;