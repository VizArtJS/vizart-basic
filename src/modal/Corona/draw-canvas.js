import drawGridArc from "./draw-grid-arc";
import drawGridLabel from "./draw-grid-label";
import drawAxisLabel from './draw-axis-label';
import drawArea from './draw-area';
import drawLine from './draw-line';

const drawCanvas = (context, state, opt, innerRadius, outerRadius, minY, maxY)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    drawGridArc(context, opt, innerRadius, outerRadius);
    drawGridLabel(context, opt, innerRadius, outerRadius, minY, maxY);
    drawAxisLabel(context, state, opt, innerRadius, outerRadius);

    if (opt.plots.isArea === true) {
        drawArea(context, state, opt, innerRadius, outerRadius)
    } else {
        drawLine(context, state, opt, innerRadius, outerRadius)
    }

    context.restore();

}

export default drawCanvas;