import {mouse} from 'd3-selection';
import {uuid, linearStops, applyVoronoi, applyQuadtree, svg, canvas} from 'vizart-core';
import cartesian from '../../base/cartesian';
import cartesianBasic from '../../base/cartesianBasic'
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


const _animate = (previousState, data, opt, x, y, frontCanvas, frontContext, tooltip, listeners)=> {
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
        ctx,
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

        frontContext.on('mousemove', mouseMoveHandler);
        frontContext.on('mouseout', mouseOutHandler);

        listeners.call('rendered');
    });
}


const plotArea = (chart) => Object.assign({}, chart, {

})

const areaOpt = opt => createCartesianOpt(AreaOpt, opt);
const area = (id, opt) => {
    const h1 = svg(id, opt, areaOpt);
    const h2 = canvas(h1);
    const h3 = cartesian(h2);
    const h4 = cartesianBasic(h3);
    const h5 = plotArea(h4);
    return h5;
};

// const area = (id, opt) =>
//         compose(base(id, opt, areaOpt),
//         canvas,
//         cartesian,
//         cartesianBasic,
//         plotArea);

export default area;
