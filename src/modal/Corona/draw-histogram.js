import { randomUniform } from 'd3-random';
import getRadius from './get-radius';
const SliceNum = 144;

const limitLine = (length, start, radius)=> {
    const r = radius - length;

    return start < Math.PI
        ? [r * Math.cos(start), r * Math.sin(start)]
        : [r * Math.cos(start), r * Math.sin(start)];
}


const drawHistogram = (context, state, opt)=> {
    const [innerRadius, outerRadius] = getRadius(opt);

    const arcRadius = innerRadius - 30;
    const slice = 2 * Math.PI / SliceNum;

    const random = randomUniform(20, 50);

    for (let i = 0; i < SliceNum; i++) {
        const start = slice * i;

        const sx = arcRadius * Math.cos(start);
        const sy = arcRadius * Math.sin(start);

        context.save();
        context.translate(opt.chart.width / 2, opt.chart.height / 2);

        const [newX, newY] = limitLine(random(), start, arcRadius);
        context.rotate(start); //Rotate into final start position

        context.beginPath();

        context.strokeStyle = '#BFBFBF';
        context.lineWidth = 4;
        context.moveTo(sx, sy);
        context.lineTo(newX, newY);

        context.stroke();
        // context.closePath();
        context.restore();
    }

}

export default drawHistogram;