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
        // node
        context.beginPath();

        context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        context.fillStye = p.c;

        context.globalAlpha = p.alpha;
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

        this.pathLayer;
        this.nodeLayer;
        this._curve;
        this._baseLine;
    }

    render(_data) {
        super.render(_data);

        this.pathLayer = this._detachedContainer.append('g').attr('class', 'series-layer');
        this.nodeLayer = this._detachedContainer.append('g').attr('class', 'node-layer');

        if (this._options.plots.drawArea === true) {
            this._curve = area()
                .x(this._x)
                .y0(this._options.chart.innerHeight)
                .y1(this._y)
                .context(this._frontContext);

            this._baseLine = area()
                .x(this._x)
                .y0(this._options.chart.innerHeight)
                .y1(this._options.chart.innerHeight)
                .context(this._frontContext);

        } else {
            this._curve = line()
                .x(this._x)
                .y(this._y)
                .context(this._frontContext);


            this._baseLine = line()
                .x(this._x)
                .y(this._options.chart.innerHeight)
                .context(this._frontContext);

        }

        interpolateCurve(this._options.plots.curve, [this._curve, this._baseLine]);


        const initY = new Array(this._data.length).fill(0);
        const changeX = interpolate(this._data.map(d=> this._x(d)), this._data.map(d=> this._x(d)));
        const changeY = interpolate(initY, this._data.map(d=> this._y(d)));

        const data = this._data;

        this._drawDetached(data);
        this._drawCanvas(data);
    }

    update() {
        super.update();

        interpolateCurve(this._options.plots.curve, [this._curve, this._baseLine]);

        this._updateDetached();
        this._drawCanvas();
    }

    /**
     * detached node manipulation. all detached svg objects are under <vizart> namespace
     *
     * @param data
     * @private
     */
    _drawDetached(data) {
        if (this._options.plots.drawArea === true) {
            this.pathLayer.append("path")
                .datum(data)
                .style('stroke', 'none')
                .style('stroke-width', this._options.plots.strokeWidth + 'px')
                .attr("d", this._baseLine)
                .attr('class', 'path')
                .transition()
                .duration(this._options.animation.duration.update)
                .delay((d, i) => {
                    return i / this._data.length * this._options.animation.duration.update;
                })
                .attr("d", this._curve);
        } else {
            this.pathLayer.append("path")
                .datum(data)
                .style('fill', 'none')
                .attr("d", this._baseLine)
                .attr('class', 'path')
                .transition()
                .duration(this._options.animation.duration.update)
                .delay((d, i) => {
                    return i / this._data.length * this._options.animation.duration.update;
                })
                .ease(easeCubicOut)
                .attr("d", this._curve);
        }

        this.nodeLayer.selectAll(".node")
            .data(data)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", this._options.plots.nodeRadius)
            .attr("cx", this._x)
            .attr("cy", this._options.chart.innerHeight)
            .attr('fill', this.nodeColor)
            .attr('opacity', 0)
            .transition()
            .duration(this._options.animation.duration.update)
            .attr("cy", this._y);
    }

    _updateDetached(data) {
        this.pathLayer.select('.path')
            .datum(this._data)
            .duration(this._options.animation.duration.update)
            .delay((d, i) => {
                return i / this._data.length * this._options.animation.duration.update;
            })
            .style('stroke-width', this._options.plots.strokeWidth + 'px')
            .attr("d", this._curve);

        let nodes_update = this.nodeLayer.selectAll(".node")
            .data(this._data);

        nodes_update.exit()
            .transition("remove-transition")
            .duration(this._options.animation.duration.remove)
            .attr('opacity', 0)
            .remove();

        nodes_update
            .attr("cx", this._x)
            .transition("update-transition")
            .duration(this._options.animation.duration.remove)
            .delay((d, i) => {
                return i / this._data.length * this._options.animation.duration.remove
            })
            .attr('opacity', this._options.plots.showDots ? 1 : 0)
            .attr("r", this._options.plots.nodeRadius)
            .attr("cy", this._y);

        nodes_update.enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", this._options.plots.nodeRadius)
            .attr("cx", this._x)
            .attr("cy", this._options.chart.innerHeight)
            .attr('fill', this.nodeColor)
            .attr('opacity', this._options.plots.showDots ? 0.2 : 0)
            .transition("update-transition")
            .duration(this._options.animation.duration.update)
            .delay((d, i) => {
                return i / this._data.length * this._options.animation.duration.update
            })
            .attr("cy", this._y)
            .attr('opacity', this._options.plots.showDots ? 1 : 0);
    }

    /**
     * canvas manipulation
     *
     * @param data
     * @private
     */
    _drawCanvas() {
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
        timer( (timeSinceStart)=> {
            let t = Math.min(timeSinceStart/Duration, 1);

            draw(that._frontContext,
                interpolateParticles(t),
                that._frontCanvas.node().width,
                that._frontCanvas.node().height,
                that._options,
                that._curve,
                that._data);


            if (t === 1) {
                return true;
            }
        });
    }

}


export default Area;