import { drawCircularText } from 'vizart-core';
import getAxisLabel from './get-axis-label';

const drawAxisLabel = (context, dimensions, opt, radius)=> {
    const angle = 2 * Math.PI / dimensions.length;

    // const radius = Math.floor(Math.pow(d.r,2) * Math.PI / 12);
    for (let i=0; i<dimensions.length; i++) {

        drawCircularText(context,
            getAxisLabel(opt, dimensions[i], i),
            14,
            'Oswald',
            opt.plots.axisLabelColor,
            opt.chart.innerWidth / 2,
            opt.chart.innerHeight / 2,
            radius + opt.plots.outerRadiusMargin,
            angle * i + angle / 2,
            0);
    }
}

export default drawAxisLabel;