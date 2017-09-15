import { linearStops } from 'vizart-core';

/**
 * add linear gradient, x0, y0 -> x1, y1
 *
 * @param context CanvasRenderingContext2D
 * @param scheme color scheme
 * @param opacity fill opacity
 */
const linearGradient = (context, scheme, opacity)=> {
    let grd = context.createLinearGradient(
        context.canvas.clientWidth / 2,
        context.canvas.clientHeight,
        context.canvas.clientWidth / 2,
        0);

    const stops = linearStops(scheme);

    for (const {offset, color} of stops) {
        grd.addColorStop(offset, color);
    }

    return grd;
}

export default linearGradient;