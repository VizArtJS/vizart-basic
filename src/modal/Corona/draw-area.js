import {
    radialArea,
    curveCardinalClosed
} from 'd3-shape';

import transparentColor from './transparent-color';

const drawArea = (context, state, opt, innerRadius, outerRadius)=> {
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

        // if (opt.plots.drawStroke === true) {
        //     context.lineWidth = opt.plots.strokeWidth;
        //     context.strokeStyle = n.c;
        //     context.stroke();
        // }
    }
}

export default drawArea;
