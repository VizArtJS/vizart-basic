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

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    console.log(state);

    for (const n of state) {
        const shape = radialArea()
            .curve(curveCardinalClosed)
            .angle(d=>d.angle)
            .innerRadius(n.innerRadius)
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