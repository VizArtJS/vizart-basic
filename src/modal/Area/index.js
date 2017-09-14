import {
    area,
    line,
} from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { voronoi } from 'd3-voronoi';
import { mouse } from 'd3-selection';
import {
    uuid,
    linearStops
} from 'vizart-core';

import { AbstractBasicCartesianChartWithAxes } from '../../base';
import createCartesianOpt from '../../options/createCartesianOpt';
import interpolateCurve from '../../util/curve';
import applyQuadtree from './quadtree/apply';

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


const drawCell = (context, cell)=> {
    if (!cell) return false;
    context.moveTo(cell[0][0], cell[0][1]);
    for (let j = 1, m = cell.length; j < m; ++j) {
        context.lineTo(cell[j][0], cell[j][1]);
    }
    context.closePath();
    return true;
}

/**
 * Generates the next color in the sequence, going from 0,0,0 to 255,255,255.
 * via http://stackoverflow.com/a/15804183
 *
 * @param dataIndex
 * @returns {string}
 */
const genColorByIndex = dataIndex=> {
    let ret = [];
    if (dataIndex < 16777215) {
        ret.push(dataIndex & 0xff); // R
        ret.push((dataIndex & 0xff00) >> 8); // G
        ret.push((dataIndex & 0xff0000) >> 16); // B
    }
    return "rgb(" + ret.join(',') + ")";
}

/**
 *  Generates the next color in the sequence, going from 0,0,0 to 255,255,255.
 *      // via http://stackoverflow.com/a/15804183

 */
let nextCol = 1;
const genColor = ()=> {
    const color = genColorByIndex(nextCol);
    nextCol++;
    return color;
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
const draw = (context, particles, width, height, opt, hidden = false)=> {
    context.clearRect(0, 0, width, height);

    if (opt.plots.showDots === true) {
        for (const [i, p] of particles.entries()) {
            context.beginPath();
            context.fillStyle = hidden === true? genColorByIndex(i) : nodeColor(opt);
            context.globalAlpha = p.alpha;
            context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
            context.fill();
        }
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

const applyVoronoi = (context, width, height, opt, finalState)=> {
    const voronoiDiagram = voronoi()
        .x(d=> d.x)
        .y(d=> d.y)
        .extent([[-1, -1],
            [opt.chart.width + 1, opt.chart.height + 1]]);

    const diagram = voronoiDiagram(finalState);
    const links = diagram.links();
    const polygons = diagram.polygons();

    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = "#1f97e7";
    for (let p of polygons) {
        drawCell(context, p);
    }
    context.stroke();
    context.closePath();

    return voronoiDiagram;
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