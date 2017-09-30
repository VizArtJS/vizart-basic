import isNumber from 'lodash-es/isNumber';
import isFinite from 'lodash-es/isFinite';
import { arc } from 'd3-shape';

const drawGridArc = (context, innerRadius, outerRadius, opt)=> {
    let levels = opt.data.y[0].ticksTier + 1;

    if (isNumber(opt.plots.levels)
        && isFinite(opt.plots.levels)
        && parseInt(opt.plots.levels) > 0) {
        levels = parseInt(opt.plots.levels);
    }

    const gridArc = arc()
        .innerRadius( d=> (outerRadius - innerRadius) / levels * (d - 1) + innerRadius)
        .outerRadius(d=> (outerRadius - innerRadius) / levels * (d) + innerRadius)
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .context(context);

    for (let i = 1; i< levels + 1; i++) {
        context.beginPath();
        context.strokeStyle = opt.plots.levelColor;
        gridArc(i);
        context.stroke();
    }
}

export default drawGridArc;
