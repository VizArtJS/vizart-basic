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

    if (axesLength < axisNum) {
        axisNum = axesLength;
    }

    const mapToAxis = scaleLinear().domain([0, axisNum]).range([0, axesLength]).nice();

    for (let i = 0; i < axisNum; i++) {
        drawCircularText(context,
            getLabel(opt, axes[mapToAxis(i)], mapToAxis(i)) + '',
            14,
            'Oswald',
            opt.plots.axisLabelColor,
            opt.chart.width / 2,
            opt.chart.height / 2,
            outerRadius + opt.plots.axisLabelOffset,
            axisScale(i), 5);
    }
}

export default drawAxisLabel;
