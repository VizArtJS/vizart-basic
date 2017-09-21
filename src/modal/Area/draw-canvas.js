import drawPoints from './draw-points';
import drawArea from './draw-area';
import drawLine from './draw-line';

/**
 * a particle contains x, y, r, c, alpha
 *
 * @param context
 * @param particles, particle colors may be defined in rgb string and thus cannot be recognized by
 * canvas. This is caused by d3's interpolation.
 */
const drawCanvas = (context, particles, opt, hidden = false)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if (hidden === true) {
        drawPoints(context, particles, opt, true);
    } else {
        if (opt.plots.showDots === true) {
            drawPoints(context, particles, opt, false);
        }

        if (opt.plots.drawArea === true) {
            drawArea(context, particles, opt);
        } else {
            drawLine(context, particles, opt);
        }
    }
}

export default drawCanvas;