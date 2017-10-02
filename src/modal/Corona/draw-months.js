import { arc } from 'd3-shape';
import getRadius from './get-radius';
import drawCircularText from '../../canvas/draw-circular-text';

const Months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const ShortMonths = [
    'Jan', 'Feb', 'March', 'April', 'May', 'June',
    'July', 'Aug', 'September', 'October', 'November', 'December'
];
const Height = 20;
const Margin = 5;

const drawMonths = (context, opt)=> {
    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    const [innerRadius, outerRadius] = getRadius(opt);

    const gridArc = arc()
        .innerRadius(innerRadius - Margin - Height)
        .outerRadius(innerRadius - Margin)
        .cornerRadius(2)
        .context(context);


    context.beginPath();

    for (const [i, d] of Months.entries()) {
        const slice = Math.PI * 2 / Months.length;
        const start = slice * i;
        const end = start + slice;

        context.strokeStyle = '#DCDDDD';
        context.lineWidth = 2;
        gridArc({
            startAngle: start,
            endAngle: end
        });

        context.stroke();

        context.textAlign = "center";
        context.textBaseline = 'middle';
        context.fillStyle = '#919596';
        drawCircularText(context,
            d,
            12,
            'Oswald',
            '#919596',
            0,
            0,
            innerRadius - Margin - Height / 2 - 3,
            start + slice / 2,
            0);    }


    context.restore();
}

export default drawMonths;