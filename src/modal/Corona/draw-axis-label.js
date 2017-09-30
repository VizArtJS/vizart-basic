import { arc } from 'd3-shape';
import getLevels from './grid-levels';

const drawAxisLabel = (context, state, opt, innerRadius, outerRadius)=> {
    const gridArc = arc()
        .innerRadius(outerRadius)
        .outerRadius(outerRadius)
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

export default drawAxisLabel;
