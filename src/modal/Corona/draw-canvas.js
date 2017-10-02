import drawGridArc from "./draw-grid-arc";
import drawGridLabel from "./draw-grid-label";
import drawAxisLabel from './draw-axis-label';
import drawArea from './draw-area';
import drawLine from './draw-line';

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    drawGridArc(context, opt);
    drawGridLabel(context, state, opt);
    drawAxisLabel(context, opt);

    if (opt.plots.isArea === true) {
        drawArea(context, state, opt)
    } else {
        drawLine(context, state, opt)
    }

    context.restore();

}

export default drawCanvas;