import {
    radialLine,
    curveLinearClosed
} from 'd3-shape';

const drawLine = (context, state, opt, innerRadius, outerRadius)=> {
    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    for (const n of state) {
        const shape = opt.plots.stackLayout === true
            ? radialLine()
                .curve(curveLinearClosed)
                .angle(d=>d.angle)
                .radius(d=> d.r)
                .context(context)
            : radialLine()
                .curve(curveLinearClosed)
                .angle(d=>d.angle)
                .radius(d=> d.r1)
                .context(context);

        context.beginPath();
        context.strokeStyle = n.c;
        shape(n.values);
        context.stroke();
    }

    context.restore();
}

export default drawLine;
