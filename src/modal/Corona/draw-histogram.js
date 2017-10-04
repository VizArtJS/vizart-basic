import { randomUniform } from 'd3-random';
import { arc } from 'd3-shape';
import getRadius from './get-radius';
const SliceNum = 90;

const limitLine = (length, start, radius)=> {
    const r = radius - length;

    return start < Math.PI
        ? [r * Math.cos(start), r * Math.sin(start)]
        : [r * Math.cos(start), r * Math.sin(start)];
}


const drawHistogram = (context, state, opt)=> {
    const [innerRadius, outerRadius] = getRadius(opt);

    const arcRadius = innerRadius - 35;
    const slice = 2 * Math.PI / SliceNum;

    const random = randomUniform(10, 30);

    const shape = arc()
        .innerRadius(arcRadius + 3)
        .outerRadius(arcRadius + 3)
        .startAngle(0)
        .endAngle(Math.PI / 2)
        .context(context);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#BFBFBF';
    shape();
    context.stroke();
    context.restore();

    for (let i = 0; i < SliceNum; i++) {
        const start = slice * i;

        const sx = arcRadius * Math.cos(start);
        const sy = arcRadius * Math.sin(start);

        context.save();
        context.translate(opt.chart.width / 2, opt.chart.height / 2);

        const [newX, newY] = limitLine(random(), start, arcRadius);
        context.rotate(start); //Rotate into final start position

        context.beginPath();


        if (i === 0){
            context.save();
            context.arc(sx + 3, sy, 3, 0, 2 * Math.PI);
            context.fillStyle = '#F4FAFE';
            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.fill();
            context.restore();
        }

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