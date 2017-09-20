import {
    pie,
    arc
} from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';
import { check, Globals } from 'vizart-core';

import createCartesianOpt from '../../options/createCartesianOpt';
import AbstractCanvasChart from '../../canvas/AbstractCanvasChart';
import TooltipTpl from '../../base/tooltip-tpl';

import getLinePosition from './get-line-position';
import limitSliceValues from './limit-slice-values';

const centroidOnArc = (arc, context, radius, slice)=> {
    const [x, y] = arc.centroid(slice);
    // pythagorean theorem for hypotenuse
    const h = Math.sqrt(x * x + y * y);

    return [x / h * radius * 0.8,
        y / h * radius * 0.8]
}


const drawPolyLine = (context, slice, centroid, opt)=> {
    const start = centroid;
    const end = getLinePosition(centroid, slice, opt.plots.labelOffset);

    context.save();
    context.beginPath();
    context.strokeStyle = slice.data.c;
    context.strokeWidth = 4;

    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();

    context.translate(end[0], end[1]);
    context.textAlign = end[0] > start[0] ? "start": 'end';
    context.textBaseline = 'middle';
    context.fillStyle = 'black';
    context.fillText(slice.data.label + ': ' + slice.data.p, end[0] > start[0] ? 5 : -5, 0);
    context.restore();
}

const drawControlPoint = (context, slice, centroid, opt)=> {
    context.save();

    context.beginPath();
    context.fillStyle = slice.data.c;
    context.globalAlpha = slice.data.alpha;
    context.arc(centroid[0], centroid[1], opt.plots.labelControlPointRadius, 0, 2 * Math.PI, false);
    context.fill();

    context.strokeStyle = 'white';
    context.strokeWidth = 4;
    context.stroke();
    context.closePath();

    context.restore();

}

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const radius = Math.min(opt.chart.innerWidth, opt.chart.innerHeight) / 2;
    const arcDiagram = arc()
        .outerRadius(radius * 0.8)
        .innerRadius(() => opt.plots.isDonut ? radius * opt.plots.innerRadiusRatio : 0)
        .context(context);

    const pieDiagram = pie()
        .sort(null)
        .value(d=>d.y);

    const slices = pieDiagram(state);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    for (const s of slices) {
        context.beginPath();
        arcDiagram(s);
        context.fillStyle = s.data.c;
        context.fill();

        const outerArc = arc()
            .innerRadius(radius * 0.8)
            .outerRadius(radius * 0.8)
            .context(context);
        const centroid = centroidOnArc(outerArc, context, radius, s);

        drawControlPoint(context, s, centroid, opt);
        drawPolyLine(context, s, centroid, opt);

    }
    context.restore();
}

const DefaultOptions = {
    chart: {
        type: 'pie'
    },
    plots: {
        othersTitle: 'Others',
        isDonut: false,
        innerRadiusRatio: 0.4,
        labelOffset: 30,
        labelControlPointRadius: 6,
        labelPosition: 'auto',
        labelMinPercentage: 0.01
    },
};

class Pie extends AbstractCanvasChart {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }


    _animate() {
        const Duration = this._options.animation.duration.update;

        const initialState = this.previousState
            ? this.previousState
            : this._data.map(d=>{

                return {
                    x: this._x(d),
                    y: 0,
                    c: this._c(d),
                    alpha: 0,
                    data: d,
                    p: '0%',
                    label: this._getDimensionVal(d)
                }
            });

        const finalState = this._data.map(d=>{
            return {
                x: this._x(d),
                y: this._y(d),
                c: this._c(d),
                alpha: this._options.plots.opacity,
                data: d,
                label: this._getDimensionVal(d),
                p: ''
            }
        });

        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        const transformedInitial = limitSliceValues(initialState, this._options, this._color);
        const transformedFinal = limitSliceValues(finalState, this._options, this._color);

        const interpolateParticles = interpolateArray(transformedInitial, transformedFinal);

        let that = this;
        const batchRendering = timer( (elapsed)=> {
            const t = Math.min(1, easeCubic(elapsed / Duration));

            drawCanvas(that._frontContext,
                interpolateParticles(t),
                that._options);

            if (t === 1) {
                batchRendering.stop();


                /**
                 * callback for when the mouse moves across the overlay
                 */
                function mouseMoveHandler() {
                    // get the current mouse position
                    const [mx, my] = mouse(this);
                    const QuadtreeRadius = 100;
                    // use the new diagram.find() function to find the Voronoi site
                    // closest to the mouse, limited by max distance voronoiRadius
                    const closest = that._voronoi.find(mx, my, QuadtreeRadius);

                    if (closest) {
                        that._tooltip
                            .html( that._getTooltipHTML(closest.data.data))
                            .transition()
                            .duration(that._options.animation.tooltip)
                            .style("opacity", 1)
                            .style("left", closest[0] + "px")
                            .style("top", closest[1] + "px");

                    } else {
                        that._tooltip
                            .transition()
                            .duration(that._options.animation.tooltip)
                            .style("opacity", 0)
                    }
                }

                function mouseOutHandler() {
                    that._tooltip.style("opacity", 0)
                }

                that._frontCanvas.on('mousemove', mouseMoveHandler);
                that._frontCanvas.on('mouseout', mouseOutHandler);

                // draw hidden in parallel;
                // drawPoints(that._hiddenContext,
                //     interpolateParticles(t),
                //     that._options, true);

                that._listeners.call('rendered');
            }
        });
    }


    createOptions(_userOpt) {
        return createCartesianOpt(DefaultOptions, _userOpt);
    };

    _provideColor() {
        // pie's other slice may contain value out of range
        return super._provideColor().clamp(true);
    }
}


export default Pie