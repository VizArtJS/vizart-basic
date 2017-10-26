import { select } from 'd3-selection';
import { getTransparentColor, drawCircularText } from 'vizart-core';
import getLabelRadius from './get-label-radius';

const drawPetal = (context, selection, opt, sliceNum)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    selection.each(function(g){
        const group = select(this);
        const scale = group.attr('scale');

        let maxR = 0;
        group.selectAll('.petal').each(function(d){
            context.save();
            context.translate(opt.chart.innerWidth / 2, opt.chart.innerHeight / 2);

            const petal = select(this);
            const color = petal.attr('fill');

            context.beginPath();
            context.fillStyle = color;
            context.fillStyle = getTransparentColor(color, petal.attr('opacity'));
            context.strokeWidth = 1;
            context.strokeStyle = color;
            context.shadowColor= color;
            context.shadowBlur= 10;

            const p = new Path2D(petal.attr('d'));
            context.scale(scale, scale);
            context.fill(p);
            context.stroke(p);
            context.closePath();
            context.restore();

            maxR = Math.max(maxR, +petal.attr('r'));
        });


        const angle = Math.PI * 2 / sliceNum;
        const radius = getLabelRadius(opt, scale, maxR);

        drawCircularText(context,
            g.dimension,
            14,
            'Oswald',
            opt.plots.axisLabelColor,
            opt.chart.innerWidth / 2,
            opt.chart.innerHeight / 2,
            radius,
            angle * g.i + angle / 2,
            0);

    });
}

export default drawPetal;