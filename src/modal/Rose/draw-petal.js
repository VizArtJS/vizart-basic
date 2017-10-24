import { select } from 'd3-selection';
import { getTransparentColor } from 'vizart-core';

const drawPetal = (context, selection, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    selection.each(function(d){
        context.save();
        context.translate(opt.chart.innerWidth / 2, opt.chart.innerHeight / 2);

        const petal = select(this);

        context.beginPath();
        context.fillStyle = petal.attr('fill');

        context.fillStyle = getTransparentColor(petal.attr('fill'), petal.attr('opacity'));
        context.strokeWidth = 1;
        context.strokeStyle = petal.attr('fill');
        context.shadowColor= petal.attr('fill');
        context.shadowBlur= 10;

        const p = new Path2D(petal.attr('d'));
        context.fill(p);
        context.stroke(p);
        context.restore();
    });
}

export default drawPetal;