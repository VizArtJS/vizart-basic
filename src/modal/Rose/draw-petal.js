import { select } from 'd3-selection';
import { getTransparentColor, drawCircularText } from 'vizart-core';
import getRadius from './get-radius';

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


        const radius = getRadius(opt)[1] * scale;
        const angle = Math.PI * 2 / sliceNum;

        let textRadius;

        if (opt.plots.axisLabelAlign === true) {
            const threshold = opt.plots.axisLabelAlignThreshold > 1
                ? opt.plots.axisLabelAlignThreshold
                : radius * opt.plots.axisLabelAlignThreshold;

            textRadius = Math.max(maxR, threshold);
        } else {
            textRadius = radius;
        }

        drawCircularText(context,
            g.dimension,
            14,
            'Oswald',
            opt.plots.axisLabelColor,
            opt.chart.innerWidth / 2,
            opt.chart.innerHeight / 2,
            textRadius * scale + opt.plots.axisLabelOffset,
            angle * g.i + angle / 2,
            0);

    });
}

export default drawPetal;