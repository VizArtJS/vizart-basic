import { arc } from 'd3-shape';
import getLevels from './grid-levels';

const drawGridArc = (context, innerRadius, outerRadius, opt)=> {
    const levels = getLevels(opt);

    const gridArc = arc()
        .innerRadius( d=> (outerRadius - innerRadius) / levels * (d - 1) + innerRadius)
        .outerRadius(d=> (outerRadius - innerRadius) / levels * (d) + innerRadius)
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .context(context);

    for (let i = 1; i < levels + 1; i++) {
        context.beginPath();
        context.strokeStyle = opt.plots.levelColor;
        gridArc(i);
        context.stroke();
    }
}

export default drawGridArc;
