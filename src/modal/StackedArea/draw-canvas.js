import { area } from 'd3-shape';
import { hsl } from 'd3-color';
import interpolateCurve from '../../util/curve';

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const curve = opt.plots.stackLayout === true
        ? area()
            .x(d => d.x)
            .y0(d => d.y0)
            .y1(d => d.y1)
            .context(context)
        : area()
            .x(d => d.x)
            .y0(opt.chart.innerHeight)
            .y1(d => d.y)
            .context(context);

    for (const n of state) {
        context.save();

        const color = n.c;
        const hslColorSpace = hsl(color);
        hslColorSpace.opacity = n.alpha;

        interpolateCurve(opt.plots.curve, [curve]);
        context.beginPath();
        curve(n.values);
        context.lineWidth = opt.plots.strokeWidth;
        context.strokeStyle = color;
        context.stroke();

        context.fillStyle = hslColorSpace;

        context.fill();
        context.closePath();

        context.restore();
    }
}

export default drawCanvas