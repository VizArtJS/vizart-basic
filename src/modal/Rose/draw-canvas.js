import { arc } from 'd3-shape';

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.save();

    context.translate(opt.chart.width / 2, opt.chart.height / 2);
    for(const d of state) {
        context.fillStyle = d.c;
        context.globalAlpha = d.alpha;
        context.strokeWidth = 1;
        context.strokeStyle = 'white';

        const gridArc = arc()
            .startAngle(d=> d.startAngle)
            .endAngle(d=>d.endAngle)
            .innerRadius(0)
            .outerRadius(d=>d.r)
            .context(context);

        for (let e of d.values) {
            gridArc(e);
            context.fill();
            context.stroke();
        }
    }
    context.restore();

}

export default drawCanvas;