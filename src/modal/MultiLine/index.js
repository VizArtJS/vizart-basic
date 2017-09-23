import { line } from 'd3-shape';
import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { hsl } from 'd3-color';
import { mouse } from 'd3-selection';
import { easeCubic } from 'd3-ease';

import { AbstractStackedCartesianChartWithAxes } from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import interpolateCurve from '../../util/curve';
import applyQuadtree from '../../canvas/quadtree/apply';
import applyVoronoi from '../../canvas/voronoi/apply';

const DefaultOptions = {
    chart: {
        type: 'line_multi'
    },
    plots: {
        curve: 'linear',
        strokeWidth: 3,
        showDots: false,
        dotRadius: 4
    }
};

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const curve = line()
            .x(d => d.x)
            .y(d => d.y)
            .context(context);

    for (const n of state) {
        context.save();
        const color = n.c;
        const hslColorSpace = hsl(color);
        hslColorSpace.opacity = n.alpha;

        interpolateCurve(opt.plots.curve, [curve]);
        context.beginPath();
        curve(n.values);
        context.lineWidth = opt.plots.strokeWidth;
        context.strokeStyle = color;
        context.stroke();
        context.restore();
    }
}

const highlightLine = (context, state, opt, highlighted)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    const curve = line()
        .x(d => d.x)
        .y(d => d.y)
        .context(context);

    for (const n of state) {
        context.save();

        const color = n.c;
        const hslColorSpace = hsl(color);
        hslColorSpace.opacity = n.key === highlighted.key ? n.alpha : 0.2;
        context.strokeStyle = hslColorSpace;

        interpolateCurve(opt.plots.curve, [curve]);
        context.beginPath();
        curve(n.values);
        context.lineWidth = opt.plots.strokeWidth;
        context.stroke();
        context.restore();
    }
}



class MultiLine extends AbstractStackedCartesianChartWithAxes {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    _animate() {
        const Duration = this._options.animation.duration.update;

        const initialState = this.previousState
            ? this.previousState
            : this._data.nested.map(d => {
                return {
                    key: d.key,
                    c: this._c(d),
                    s: d.key,
                    alpha: 0,
                    values: d.values.map(e => {
                        return {
                            key: d.key,
                            x: this._x(e.data),
                            y: this._options.chart.innerHeight,
                            data: e.data
                        }
                    })
                }
            });

        const finalState = this._data.nested.map(d => {
            return {
                key: d.key,
                c: this._c(d),
                alpha: 1,
                values: d.values.map(e => {
                    return {
                        key: d.key,
                        x: this._x(e.data),
                        y: e.y,
                        data: e.data
                    }
                })
            }
        });

        // cache finalState as the initial state of next animation call
        this.previousState = finalState;

        const interpolateParticles = interpolateArray(initialState, finalState);

        let that = this;
        const batchRendering = timer((elapsed) => {
            const t = Math.min(1, easeCubic(elapsed / Duration));

            drawCanvas(that._frontContext,
                interpolateParticles(t),
                that._options);

            if (t === 1) {
                batchRendering.stop();

                that._voronoi = applyVoronoi(that._frontContext,
                    that._options, finalState.reduce((acc, p)=>{
                        acc = acc.concat(p.values);
                        return acc;
                    }, []));

                // that._quadtree = applyQuadtree(that._frontContext,
                //     that._options, finalState);

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
                        that._tooltip.style("left", closest[0] + "px")
                            .style("top", closest[1] + "px")
                            .html( that.tooltip(closest.data.data));

                        highlightLine(that._frontContext,
                            interpolateParticles(t),
                            that._options,
                            closest.data);
                        that._tooltip.style("opacity", 1);
                    } else {
                        that._tooltip.style("opacity", 0);

                        drawCanvas(that._frontContext,
                            interpolateParticles(t),
                            that._options);
                    }
                }

                function mouseOutHandler() {
                    that._tooltip.style("opacity", 0);

                    drawCanvas(that._frontContext,
                        interpolateParticles(t),
                        that._options);
                }

                that._frontCanvas.on('mousemove', mouseMoveHandler);
                that._frontCanvas.on('mouseout', mouseOutHandler);

                that._listeners.call('rendered');
            }
        });
    }

    createOptions(_userOpt) {
        return createCartesianStackedOpt(DefaultOptions, _userOpt);
    };
}

export default MultiLine;