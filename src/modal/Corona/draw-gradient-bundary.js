import { arc } from 'd3-shape';

import getRadius from './get-radius';


const drawGradientBoundary = (context, state, opt)=> {
    if (opt.plots.drawBoundary === false) {
        return;
    }

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);
    const [innerRadius, outerRadius] = getRadius(opt);
    const Offset = opt.plots.boundaryOffset;

    const boundary = arc()
        .innerRadius(outerRadius)
        .outerRadius(outerRadius + Offset)
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .context(context);

    context.beginPath();

    let gradient = context.createRadialGradient(0, 0, outerRadius, 0, 0, outerRadius + Offset);

    gradient.addColorStop(0, opt.plots.boundaryGradient[0]);
    gradient.addColorStop(1, opt.plots.boundaryGradient[1]);
    context.fillStyle = gradient;
    context.globalAlpha = opt.plots.boundaryOpacity;
    boundary();
    // context.arc(x, y, outerRadius, 0, 2 * Math.PI);
    context.fill();
    context.restore();

}

export default drawGradientBoundary;