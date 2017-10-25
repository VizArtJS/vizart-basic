import { arc } from 'd3-shape';
import {
    getTransparentColor,
    drawCircularText
} from 'vizart-core';
import getRadius from './get-radius';

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const gridArc = arc()
        .startAngle(d=> d.startAngle)
        .endAngle(d=>d.endAngle)
        .innerRadius(0)
        .outerRadius(d=>d.r)
        .padAngle(.04)
        .context(context);

    const angle = 2 * Math.PI / state.length;

    for(const d of state) {
        context.shadowBlur= 10;

        for (let e of d.slice) {
            context.save();
            context.translate(opt.chart.width / 2, opt.chart.height / 2);
            context.beginPath();
            context.fillStyle = getTransparentColor(e.c, e.alpha);
            context.strokeWidth = 1;
            context.strokeStyle = e.c;
            context.shadowColor= e.c;

            gridArc(e);
            context.fill();
            context.stroke();
            context.restore();

        }

        drawCircularText(context,
            d.dimension,
            14,
            'Oswald',
            opt.plots.axisLabelColor,
            opt.chart.innerWidth / 2,
            opt.chart.innerHeight / 2,
            getRadius(opt)[1] + opt.plots.outerRadiusMargin,
            angle * d.i + angle / 2,
            0);
    }
}

export default drawCanvas;