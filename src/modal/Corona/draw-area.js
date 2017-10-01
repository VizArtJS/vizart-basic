import {
    radialArea,
    curveCardinalClosed
} from 'd3-shape';

import transparentColor from './transparent-color';

const drawArea = (context, state, opt, innerRadius, outerRadius)=> {
    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

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
        context.fillStyle = transparentColor(n.c, n.alpha);
        shape(n.values);
        context.fill();

        context.lineWidth = opt.plots.strokeWidth;
        context.strokeStyle = transparentColor(n.c, opt.plots.strokeOpacity);
        context.stroke();
    }

    context.restore();
}

export default drawArea;
