import {
    arc,
    radialArea,
    radialLine,
    curveLinearClosed,
    curveCardinalClosed
} from 'd3-shape';

import isNumber from 'lodash-es/isNumber';
import isFinite from 'lodash-es/isFinite';


import { hsl } from 'd3-color';

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


    let levels = opt.data.y[0].ticksTier + 1;

    if (isNumber(opt.plots.levels)
        && isFinite(opt.plots.levels)
        && parseInt(opt.plots.levels) > 0) {
        levels = parseInt(opt.plots.levels);
    }

    const gridArc = arc()
        .innerRadius( d=> (outerRadius - innerRadius) / levels * (d - 1) + innerRadius)
        .outerRadius(d=> (outerRadius - innerRadius) / levels * (d) + innerRadius)
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .context(context);

    for (let i = 1; i< levels + 1; i++) {
        context.beginPath();
        context.strokeStyle = 'grey';
        gridArc(i);
        context.stroke();
    }


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