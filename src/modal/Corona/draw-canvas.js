import drawGridArc from "./draw-grid-arc";
import drawGridLabel from "./draw-grid-label";
import drawArea from './draw-area';
import drawLine from './draw-line';

const drawCanvas = (context, state, opt, innerRadius, outerRadius, minY, maxY)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    drawGridArc(context, innerRadius, outerRadius, opt);
    drawGridLabel(context, innerRadius, outerRadius, opt, minY, maxY);

    if (opt.plots.isArea === true) {
        drawArea(context, state, opt, innerRadius, outerRadius)
    } else {
        drawLine(context, state, opt, innerRadius, outerRadius)
    }

    context.restore();

}

export default drawCanvas;