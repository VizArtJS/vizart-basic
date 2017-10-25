import { arc } from 'd3-shape';
import { genColorByIndex } from 'vizart-core';

const drawHiddenCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    const colorMap = new Map();

    const gridArc = arc()
        .startAngle(d=> d.startAngle)
        .endAngle(d=>d.endAngle)
        .innerRadius(0)
        .outerRadius(d=>d.r)
        .padAngle(.04)
        .context(context);

    let i = 0;

    for(const d of state) {
        for (let e of d.slice) {
            const color = genColorByIndex(++i);

            context.save();
            context.translate(opt.chart.width / 2, opt.chart.height / 2);
            context.beginPath();
            context.fillStyle = color;

            gridArc(e);
            context.fill();
            context.restore();

            colorMap.set(color, e);
        }
    }

    return colorMap;
}

export default drawHiddenCanvas;