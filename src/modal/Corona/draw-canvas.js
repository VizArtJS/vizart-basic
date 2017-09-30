import {
    radialArea,
    radialLine,
    curveLinearClosed,
    curveCardinalClosed
} from 'd3-shape';




import { hsl } from 'd3-color';
import drawGridArc from "./draw-grid-arc";

const transparentColor = d => {
    const color = d.c;
    const hslColorSpace = hsl(color);
    hslColorSpace.opacity = d.alpha;

    return hslColorSpace;
}

const drawCanvas = (context, state, opt, innerRadius, outerRadius)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);


    drawGridArc(context, innerRadius, outerRadius, opt);

    for (const n of state) {
        const shape = opt.plots.stackLayout === true
            ? radialArea()
                .curve(curveCardinalClosed)
                .angle(d=>d.angle)
                .innerRadius(d=> d.r0)
                .outerRadius(d=> d.r1)
                .context(context)
            : radialArea()
                .curve(curveCardinalClosed)
                .angle(d=>d.angle)
                .innerRadius(innerRadius)
                .outerRadius(d=> d.r)
                .context(context);


        context.beginPath();
        context.fillStyle = transparentColor(n);
        shape(n.values);
        context.fill();
    }

    context.restore();
}

export default drawCanvas;