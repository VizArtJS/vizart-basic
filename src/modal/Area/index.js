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
import applyVoronoi from './voronoi';
import gradientStroke from './gradient-stroke';
import genColorByIndex from './generate-color';

const AreaOpt = {
    chart: {
        type: 'area_horizontal'
    },
    plots: {
        areaOpacity: 1,
        curve: 'linear',
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

const drawPoints = (context, particles, width, height, opt, hidden)=> {
    for (const [i, p] of particles.entries()) {
        context.beginPath();
        context.fillStyle = hidden === true? genColorByIndex(i) : nodeColor(opt);
        context.globalAlpha = p.alpha;
        context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        context.fill();
    }
}

const drawLine = (context, particles, width, height, opt)=> {
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

/**
 * a particle contains x, y, r, c, alpha
 *
 * @param context
 * @param particles, particle colors may be defined in rgb string and thus cannot be recognized by
 * canvas. This is caused by d3's interpolation.
 */
const draw = (context, particles, width, height, opt, hidden = false)=> {
    context.clearRect(0, 0, width, height);

    if (hidden === true) {
        drawPoints(context, particles, width, height, opt, true);
    } else {
        if (opt.plots.showDots === true) {
            drawPoints(context, particles, width, height, opt, false);
        }

        drawLine(context, particles, width, height, opt)
    }
}



const euclideanDistance =(x1, y1, x2, y2)=> {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}


class Area extends AbstractBasicCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    render(_data) {
        super.render(_data);
        // this._getMetric().scale.range([this._frontCanvas.node().height, 0]);
        // this._getDimension().scale.range([0, this._frontCanvas.node().width]);
        this._animate();
    }

    update() {
        super.update();
        this._getMetric().scale.range([this._frontCanvas.node().height, 0]);
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
                that._frontCanvas.node().width,
                that._frontCanvas.node().height,
                that._options);

            if (t === 1) {
                batchRendering.stop();
                that._voronoi = applyVoronoi(that._frontContext,
                    that._hiddenCanvas.node().width,
                    that._hiddenCanvas.node().height,
                    that._options, finalState);

                that._quadtree = applyQuadtree(that._frontContext,
                    that._hiddenCanvas.node().width,
                    that._hiddenCanvas.node().height,
                    that._options, finalState);

                /**
                 * callback for when the mouse moves across the overlay
                 */
                function mouseMoveHandler() {
                    console.log('------')
                    // get the current mouse position
                    const [mx, my] = mouse(this);
                    const QuadtreeRadius = 20;
                    // use the new diagram.find() function to find the Voronoi site
                    // closest to the mouse, limited by max distance voronoiRadius
                    const closest = that._quadtree.find(mx, my, QuadtreeRadius);

                    that._tooltip.style("left", closest[0] + "px")
                        .style("top", closest[1] + "px")
                        .html( that._getTooltipHTML(d));

                    that._tooltip.style("opacity", 1)
                }

                function mouseOutHandler() {
                    that._tooltip.style("opacity", 0)
                }

                console.log(that._frontCanvas)

                that._frontCanvas.on('mousemove', mouseMoveHandler);
                that._frontCanvas.on('mouseout', mouseOutHandler);
                that._frontCanvas.on('click', function(){
                    console.log('--')
                });

                // draw hidden in parallel;
                draw(that._hiddenContext,
                    interpolateParticles(t),
                    that._hiddenCanvas.node().width,
                    that._hiddenCanvas.node().height,
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

    createOptions(_userOpt) {
        return createCartesianOpt(AreaOpt, _userOpt);
    };
}


export default Area;