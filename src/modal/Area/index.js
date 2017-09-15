import {
    area,
    line,
} from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { mouse } from 'd3-selection';
import {
    uuid,
    linearStops
} from 'vizart-core';

import { AbstractBasicCartesianChartWithAxes } from '../../base';
import createCartesianOpt from '../../options/createCartesianOpt';
import interpolateCurve from '../../util/curve';
import applyQuadtree from './quadtree/apply';
import applyVoronoi from './voronoi/apply';
import linearGradient from './gradient-stroke';
import genColorByIndex from './generate-color';
import TooltipTpl from './tooltip-tpl';

const AreaOpt = {
    chart: {
        type: 'area_horizontal'
    },
    plots: {
        areaOpacity: 0.7,
        curve: 'basis',
        strokeWidth: 4,
        nodeRadius: 4,
        drawArea: true,
        showDots: true
    }
}


const nodeColor = opt=> {
    const stops = linearStops(opt.color.scheme);
    return stops[stops.length - 1].color;
}

const drawPoints = (context, particles, opt, hidden)=> {
    for (const [i, p] of particles.entries()) {
        context.beginPath();
        context.fillStyle = hidden === true? genColorByIndex(i) : nodeColor(opt);
        context.globalAlpha = p.alpha;
        context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        context.fill();
    }
}

const drawLine = (context, particles, opt)=> {
    const curve = line()
            .x(d=>d.x)
            .y(d=>d.y)
            .context(context);
    interpolateCurve(opt.plots.curve, [curve]);

    context.beginPath();
    curve(particles);
    context.lineWidth = opt.plots.strokeWidth;
    const gradientStyle = linearGradient(context, opt.color.scheme);
    context.strokeStyle = gradientStyle;

    context.stroke();
    context.closePath();
}

const drawArea = (context, particles, opt)=> {
    const curve = area()
        .x(d=>d.x)
        .y0(context.canvas.height)
        .y1(d=>d.y)
        .context(context);

    interpolateCurve(opt.plots.curve, [curve]);
    context.beginPath();
    curve(particles);
    context.lineWidth = opt.plots.strokeWidth;
    const gradientStyle = linearGradient(context, opt.color.scheme);
    context.fillStyle = gradientStyle;
    context.globalAlpha = opt.plots.areaOpacity;
    context.strokeStyle = nodeColor(opt);
    context.stroke();

    context.fill();
    context.closePath();
}

/**
 * a particle contains x, y, r, c, alpha
 *
 * @param context
 * @param particles, particle colors may be defined in rgb string and thus cannot be recognized by
 * canvas. This is caused by d3's interpolation.
 */
const draw = (context, particles, opt, hidden = false)=> {
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

class Area extends AbstractBasicCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    render(_data) {
        super.render(_data);
        // this._getMetric().scale.range([this._frontCanvas.node().height, 0]);
        // console.log(this._getMetric().scale.range());
        this._getDimension().scale.range([0, this._frontCanvas.node().width]);
        this._animate();
    }

    update() {
        super.update();
        // this._getMetric().scale.range([this._frontCanvas.node().height, 0]);
        this._getDimension().scale.range([0, this._frontCanvas.node().width]);
        this._animate();
    }

    _animate() {
        const Duration = this._options.animation.duration.update;
        const stops = linearStops(this._options.color.scheme);
        const nodeColor = stops[stops.length - 1].color;

        const initialState = this.previousState
            ? this.previousState
            : this._data.map(d=>{
                return {
                    x: this._x(d),
                    y: this._frontCanvas.node().height,
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

        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        const interpolateParticles = interpolateArray(initialState, finalState);

        let that = this;
        const batchRendering = timer( (timeSinceStart)=> {
            let t = Math.min(timeSinceStart/Duration, 1);

            draw(that._frontContext,
                interpolateParticles(t),
                that._options);

            if (t === 1) {
                batchRendering.stop();

                that._voronoi = applyVoronoi(that._frontContext,
                    that._options, finalState);

                that._quadtree = applyQuadtree(that._frontContext,
                    that._options, finalState);

                /**
                 * callback for when the mouse moves across the overlay
                 */
                function mouseMoveHandler() {
                    // get the current mouse position
                    const [mx, my] = mouse(this);
                    const QuadtreeRadius = 20;
                    // use the new diagram.find() function to find the Voronoi site
                    // closest to the mouse, limited by max distance voronoiRadius
                    const closest = that._quadtree.find(mx, my, QuadtreeRadius);

                    if (closest ) {
                        that._tooltip.style("left", closest[0] + "px")
                            .style("top", closest[1] + "px")
                            .html( that._getTooltipHTML(closest.data));

                        that._tooltip.style("opacity", 1)
                    }
                }

                function mouseOutHandler() {
                    that._tooltip.style("opacity", 0)
                }


                that._frontCanvas.on('mousemove', mouseMoveHandler);
                that._frontCanvas.on('mouseout', mouseOutHandler);

                // draw hidden in parallel;
                draw(that._hiddenContext,
                    interpolateParticles(t),
                    that._options, true);
            }
        });
    }

    transitionColor(color) {
        this._options.color = color;

        this.update();
    }

    sort(accessor, direction) {
        this._options.ordering = {
            accessor: accessor,
            direction: direction
        };

        this.update();
    }

    _getTooltipHTML(d) {
        return TooltipTpl
            .replace("{{header}}", d.x)
            .replace("{{name}}", this._getMetric().name)
            .replace("{{value}}", d.y)
            .replace("{{borderStroke}}", this._color(d.y));
    }

    createOptions(_userOpt) {
        return createCartesianOpt(AreaOpt, _userOpt);
    };
}


export default Area;