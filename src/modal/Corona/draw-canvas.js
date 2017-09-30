import drawGridArc from "./draw-grid-arc";
import drawArea from './draw-area';
import drawLine from './draw-line';

const drawCanvas = (context, state, opt, innerRadius, outerRadius)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    drawGridArc(context, innerRadius, outerRadius, opt);

    if (opt.plots.isArea === true) {
        drawArea(context, state, opt, innerRadius, outerRadius)
    } else {
        drawLine(context, state, opt, innerRadius, outerRadius)
    }

    context.restore();

}

export default drawCanvas;