import { arc } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import isFunction from 'lodash-es/isFunction';
import drawCircularText from '../../canvas/draw-circular-text';

const getLabel = (opt, d, i)=> {
    return opt.plots.axisLabel && isFunction(opt.plots.axisLabel)
        ? opt.plots.axisLabel(d, i)
        : d;
}

const drawAxisLabel = (context, opt, innerRadius, outerRadius)=> {
    let axisNum = 6;
    const axisScale = scaleLinear().domain([0, axisNum]).range([0, 2 * Math.PI]);

    const axes = opt.data.x.values;
    const axesLength = axes.length;

    if (axesLength >= axisNum) {
    } else {
        axisNum = axesLength;
    }

    const s1 = scaleLinear().domain([0, axisNum]).range([0, axesLength]);

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
        drawCircularText(context, getLabel(opt, axes[s1(i)], s1(i)) + '', 14, 'Oswald',
            opt.chart.width / 2, opt.chart.height / 2, outerRadius + opt.plots.axisLabelOffset,
            axisScale(i), 5, 1);
    }
}

export default drawAxisLabel;
