import {mouse} from 'd3-selection';
import { linearStops, applyVoronoi, applyQuadtree, svg, canvas, genericColor} from 'vizart-core';
import cartesian from '../../base/cartesian';
import cartesianBasic from '../../base/cartesianBasic';
import { processCartesianData } from '../../data';
import tooltipMarkup from '../../base/tooltip';

import createCartesianOpt from '../../options/createCartesianOpt';
import animateStates from './tween-states';
import drawCanvas from './draw-canvas';
import highlightNode from './highlight-node';

const AreaOpt = {
    chart: {
        type: 'area_horizontal',
    },
    plots: {
        areaOpacity: 0.3,
        curve: 'basis',
        strokeWidth: 2,
        highlightNodeColor: '#F03E1E',
        nodeRadius: 4,
        drawArea: true,
        showDots: false,
    },
};


const _animateArea = (previousState, data, opt, x, y, frontCanvas, frontContext, tooltip, listeners)=> {
    console.log('------')
    const stops = linearStops(opt.color.scheme);
    const nodeColor = stops[stops.length - 1].color;

    const initialState = previousState
        ? previousState
        : data.map(d => {
            return {
                x: x(d),
                y: frontCanvas.node().height,
                r: opt.plots.nodeRadius,
                c: nodeColor,
                alpha: 0,
                data: d,
            };
        });

    const finalState = data.map(d => {
        return {
            x: x(d),
            y: y(d),
            r: opt.plots.nodeRadius,
            c: nodeColor,
            alpha: 1,
            data: d,
        };
    });

    let that = this;
    let voronoi = null;

    animateStates(
        initialState,
        finalState,
        opt.animation.duration.update,
        frontContext,
        opt
    ).then(res => {
        voronoi= applyVoronoi(frontContext, opt, res);

        // this._quadtree = applyQuadtree(ctx, opt, res);

        /**
         * callback for when the mouse moves across the overlay
         */
        function mouseMoveHandler() {
            // get the current mouse position
            const [mx, my] = mouse(this);
            const QuadtreeRadius = 100;
            // use the new diagram.find() function to find the Voronoi site
            // closest to the mouse, limited by max distance voronoiRadius
            const closest = voronoi.find(mx, my, QuadtreeRadius);

            if (closest) {
                tooltip
                    .html(that.tooltip(closest.data.data))
                    .transition()
                    .duration(opt.animation.tooltip)
                    .style('left', mx + opt.tooltip.offset[0] + 'px')
                    .style('top', my + opt.tooltip.offset[1] + 'px')
                    .style('opacity', 1);

                drawCanvas(ctx, res, opt, false);
                highlightNode(ctx, opt, closest.data, closest[0], closest[1]);
            } else {
                tooltip
                    .transition()
                    .duration(opt.animation.tooltip)
                    .style('opacity', 0);

                drawCanvas(ctx, res, opt, false);
            }
        }

        function mouseOutHandler() {
            tooltip
                .transition()
                .duration(opt.animation.tooltip)
                .style('opacity', 0);

            drawCanvas(frontContext, res, opt, false);
        }

        frontCanvas.on('mousemove', mouseMoveHandler);
        frontCanvas.on('mouseout', mouseOutHandler);

        listeners.call('rendered');
    });
}


const plotArea = (chart) => Object.assign({}, chart, {
    _animate(){
        _animateArea(chart._previousState, chart._data, chart._options, chart._x, chart._y, chart._frontCanvas, chart._frontContext, chart._tooltip, chart._listeners)
    },

    render(data){
        console.log('------')
        chart.render(data);
        chart.data();
        this._animate();
    },

    update(){
        chart.update();
        this._animate();
    }
})

const cartesianColor = (colorOpt, data, opt)=> genericColor(colorOpt, data.map(d=> d[opt.data.y[0].accessor]));

const areaOpt = opt => createCartesianOpt(AreaOpt, opt);
const composers = {
    opt: areaOpt,
    data: processCartesianData,
    color: cartesianColor,
}

const area = (id, opt) => {
    const h1 = svg(id, opt, composers);
    const h2 = canvas(h1);
    const h3 = cartesian(h2);
    return plotArea(h3);
};

// const area = (id, opt) =>
//         compose(base(id, opt, areaOpt),
//         canvas,
//         cartesian,
//         cartesianBasic,
//         plotArea);

export default area;
