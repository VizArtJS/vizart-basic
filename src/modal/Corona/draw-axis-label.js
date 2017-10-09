import { scaleLinear } from 'd3-scale';

import drawCircularText from '../../canvas/helper/draw-circular-text';
import getAxisLabel from './get-axis-label';
import getRadius from "./get-radius";

const drawAxisLabel = (context, opt)=> {
    let axisNum = 6;
    const axisScale = scaleLinear().domain([0, axisNum]).range([0, 2 * Math.PI]);
    const [innerRadius, outerRadius] = getRadius(opt);

    const axes = opt.data.x.values;
    const axesLength = axes.length;

    if (axesLength < axisNum) {
        axisNum = axesLength;
    }

    const mapToAxis = scaleLinear().domain([0, axisNum]).range([0, axesLength]).nice();

    for (let i = 0; i < axisNum; i++) {
        drawCircularText(context,
            getAxisLabel(opt, axes[mapToAxis(i)], mapToAxis(i)) + '',
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
