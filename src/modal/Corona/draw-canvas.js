import {
    arc,
    radialArea,
    radialLine,
    curveLinearClosed,
    curveCardinalClosed
} from 'd3-shape';


import { hsl } from 'd3-color';

const transparentColor = d => {
    const color = d.c;
    const hslColorSpace = hsl(color);
    hslColorSpace.opacity = d.alpha;

    return hslColorSpace;
}



const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    console.log(state);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    const shape = radialArea()
        .curve(curveCardinalClosed)
        .angle(d=>d.angle)
        .innerRadius(d=> d.r0)
        .outerRadius(d=> d.r1)
        .context(context);


    for (const n of state) {
        context.beginPath();
        context.fillStyle = transparentColor(n);
        shape(n.values);
        context.fill();
    }

    context.restore();
}

export default drawCanvas;