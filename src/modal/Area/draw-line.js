import { line } from 'd3-shape';
import interpolateCurve from '../../util/curve';
import linearGradient from '../../canvas/helper/vertical-gradiet';

const drawLine = (context, particles, opt)=> {
    const curve = line()
        .x(d=>d.x)
        .y(d=>d.y)
        .context(context);
    interpolateCurve(opt.plots.curve, [curve]);

    context.beginPath();
    curve(particles);
    context.lineWidth = opt.plots.strokeWidth;
    const gradientStyle = linearGradient(context, opt.color.scheme, 1);
    context.strokeStyle = gradientStyle;

    context.stroke();
    context.closePath();
}

export default drawLine;