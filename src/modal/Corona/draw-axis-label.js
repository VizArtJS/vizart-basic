import { arc } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import drawCircularText from '../../canvas/draw-circular-text';

const drawAxisLabel = (context, opt, innerRadius, outerRadius)=> {
    const axisArc = arc()
        .innerRadius(outerRadius)
        .outerRadius(outerRadius);

    const axisNum = 6;
    const axisScale = scaleLinear().domain([0, axisNum]).range([0, 2 * Math.PI]);

    for (let i = 0; i < axisNum; i++) {
        const centroidPoint = axisArc.centroid({
            startAngle: axisScale(i),
            endAngle: axisScale(i + 1)
        });

        // context.textAlign = "center";
        // context.textBaseline = 'top';
        // context.fillStyle = opt.plots.axisLabelColor;
        // context.fillText(
        //     opt.data.x.values[i],
        //     centroidPoint[0],
        //     centroidPoint[1],
        //     30);
        //
        // drawCircularText(context, opt.data.x.values[i], 14, 'arial',
        //     0, 0, outerRadius,
        //     axisScale(i), 5, 1);
    }
}

export default drawAxisLabel;
