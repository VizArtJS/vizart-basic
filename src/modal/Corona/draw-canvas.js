import drawGridArc from "./draw-grid-arc";
import drawGridLabel from "./draw-grid-label";
import drawAxisLabel from './draw-axis-label';
import drawArea from './draw-area';
import drawLine from './draw-line';
import getRadius from "./get-radius";

const drawCanvas = (context, state, opt, minY, maxY)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const [innerRadius, outerRadius] = getRadius(opt);

    drawGridArc(context, opt, innerRadius, outerRadius);
    drawGridLabel(context, opt, innerRadius, outerRadius, minY, maxY);
    drawAxisLabel(context, opt, innerRadius, outerRadius);

    if (opt.plots.isArea === true) {
        drawArea(context, state, opt, innerRadius)
    } else {
        drawLine(context, state, opt)
    }

    context.restore();

}

export default drawCanvas;