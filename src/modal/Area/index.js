import { easeCubicOut } from 'd3-ease';
import {
    area,
    line
} from 'd3-shape';
import {
    interpolate,
    interpolateArray
} from 'd3-interpolate';
import { timer } from 'd3-timer';
import {
    uuid,
    linearStops
} from 'vizart-core';

import { AbstractBasicCartesianChartWithAxes } from '../../base';
import createCartesianOpt from '../../options/createCartesianOpt';
import interpolateCurve from '../../util/curve';

const AreaOpt = {
    chart: {
        type: 'area_horizontal'
    },
    plots: {
        areaOpacity: 1,
        curve: 'basis',
        strokeWidth: 4,
        nodeRadius: 4,
        drawArea: true,
        showDots: true
    }
}

/**
 *  Generates the next color in the sequence, going from 0,0,0 to 255,255,255.
 */
let nextCol = 1;
const genColor = ()=> {
    let ret = [];
    // via http://stackoverflow.com/a/15804183
    if (nextCol < 16777215) {
        ret.push(nextCol & 0xff); // R
        ret.push((nextCol & 0xff00) >> 8); // G
        ret.push((nextCol & 0xff0000) >> 16); // B

        nextCol += 100; // This is exagerated for this example and would ordinarily be 1.
    }
    return "rgb(" + ret.join(',') + ")";
}


const nodeColor = opt=> {
    const stops = linearStops(opt.color.scheme);
    return stops[stops.length - 1].color;
}

/**
 * add linear gradient, x0, y0 -> x1, y1
 *
 * @param context
 * @param scheme
 */
const gradientStroke = (context, width, height, opt)=> {
    let grd = context.createLinearGradient(
        width / 2,
        height,
        width / 2,
        0);

    const stops = linearStops(opt.color.scheme);

    for (const {offset, color} of stops) {
        grd.addColorStop(offset, color);
    }

    context.strokeStyle = grd;
}


/**
 * a particle contains x, y, r, c, alpha
 *
 * @param context
 * @param particles, particle colors may be defined in rgb string and thus cannot be recognized by
 * canvas. This is caused by d3's interpolation.
 */
const draw = (context, particles, width, height, opt)=> {
    context.clearRect(0, 0, width, height);

    for (const p of particles) {
        context.beginPath();
        context.fillStyle = nodeColor(opt);
        context.globalAlpha = p.alpha;

        context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);

        context.fill();
    }

    const curve = (opt.plots.drawArea === true)
        ? area()
            .x(d=>d.x)
            .y0(opt.chart.innerHeight)
            .y1(d=>d.y)
            .context(context)
        : line()
            .x(d=>d.x)
            .y(d=>d.y)
            .context(context);
    interpolateCurve(opt.plots.curve, [curve]);

    context.beginPath();
    curve(particles);
    context.lineWidth = opt.plots.strokeWidth;
    gradientStroke(context, width, height, opt);

    context.stroke();
}


class Area extends AbstractBasicCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    render(_data) {
        super.render(_data);

        this._animate();
    }

    update() {
        super.update();
        this._animate();
    }

    createOptions(_userOpt) {
        return createCartesianOpt(AreaOpt, _userOpt);
    };


    _animate() {
        const Duration = this._options.animation.duration.update;
        const stops = linearStops(this._options.color.scheme);
        const nodeColor = stops[stops.length - 1].color;

        const initialState = this._data.map(d=>{
            return {
                x: this._x(d),
                y: 0,
                r: this._options.plots.nodeRadius,
                c: nodeColor,
                alpha: 0
            }
        });

        const finalState = this._data.map(d=>{
            return {
                x: this._x(d),
                y: this._y(d),
                r: this._options.plots.nodeRadius,
                c: nodeColor,
                alpha: 1
            }
        });

        const interpolateParticles = interpolateArray(initialState, finalState);

        let that = this;
        const batchRendering = timer( (timeSinceStart)=> {
            let t = Math.min(timeSinceStart/Duration, 1);

            draw(that._frontContext,
                interpolateParticles(t),
                that._frontCanvas.node().width,
                that._frontCanvas.node().height,
                that._options,
                that._curve,
                that._data);


            if (t === 1) {
                batchRendering.stop();
            }
        });
    }

    transitionColor(color) {
        this._options.color = color;

        this.update();
    }

}


export default Area;