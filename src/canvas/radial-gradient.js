import { linearStops } from 'vizart-core';
import { hsl } from 'd3-color';

/**
 * add linear gradient, x0, y0 -> x1, y1
 *
 * @param context CanvasRenderingContext2D
 * @param scheme color scheme
 * @param opacity fill opacity
 */
const radialGradient = (context, scheme, opacity, centerX, centerY, innerRadius, outerRadius)=> {
    let grd = context.createRadialGradient(
        centerX,
        centerY,
        innerRadius,
        centerX,
        centerY,
        outerRadius);

    const stops = linearStops(scheme, opacity);

    for (const {offset, color} of stops) {
        grd.addColorStop(offset, color);
    }

    return grd;
}

export default radialGradient;