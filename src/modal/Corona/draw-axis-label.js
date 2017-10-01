import { arc } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import isFunction from 'lodash-es/isFunction';
import drawCircularText from '../../canvas/draw-circular-text';

const getLabel = (opt, i)=> {
    return opt.plots.axisLabel && isFunction(opt.plots.axisLabel)
        ? opt.plots.axisLabel(opt.data.x.values[i])
        : opt.data.x.values[i];
}

const drawAxisLabel = (context, opt, innerRadius, outerRadius)=> {
    const axisArc = arc()
        .innerRadius(outerRadius)
        .outerRadius(outerRadius);

    const axisNum = 6;
    const axisScale = scaleLinear().domain([0, axisNum]).range([0, 2 * Math.PI]);



    for (let i = 0; i < axisNum; i++) {

        // context.textAlign = "center";
        // context.textBaseline = 'top';
        // context.fillStyle = opt.plots.axisLabelColor;
        // context.fillText(
        //     opt.data.x.values[i],
        //     centroidPoint[0],
        //     centroidPoint[1],
        //     30);
        //
        drawCircularText(context, getLabel(opt, i) + '', 14, 'Oswald',
            opt.chart.width / 2, opt.chart.height / 2, outerRadius + opt.plots.axisLabelOffset,
            axisScale(i), 5, 1);
    }
}

export default drawAxisLabel;
