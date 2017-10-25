import { select } from 'd3-selection';
import { getTransparentColor, drawCircularText } from 'vizart-core';
import getRadius from './get-radius';

const drawPetal = (context, selection, opt, sliceNum)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    selection.each(function(g){
        const group = select(this);
        const scale = group.attr('scale');

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
        });

        const radius = getRadius(opt)[1] * scale;
        const angle = Math.PI * 2 / sliceNum;

        drawCircularText(context,
            g.dimension,
            14,
            'Oswald',
            opt.plots.axisLabelColor,
            opt.chart.innerWidth / 2,
            opt.chart.innerHeight / 2,
            radius + opt.plots.axisLabelOffset,
            angle * g.i + angle / 2,
            0);

    });
}

export default drawPetal;