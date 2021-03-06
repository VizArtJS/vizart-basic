import { applyVoronoi, getTransparentColor } from 'vizart-core';
import { mouse } from 'd3-selection';
import { getDimensionVal, getMetric } from '../../helper/withCartesian';
import getRadius from './get-radius';
import animateStates from './tween-states';
import drawCanvas from './draw-canvas';
import { scaleLinear } from 'd3-scale';
import highlight from './highlight';
import { c } from '../../helper/withStacked';

const animate = state => {
  const { _options, _data, _animationState, _frontContext } = state;
  const [innerRadius, outerRadius] = getRadius(_options);
  const dataRange = [_data.minY, _data.maxY];
  const radiusScale = scaleLinear()
    .domain(dataRange.map(d => getMetric(state).scale(d)))
    .range([innerRadius, outerRadius]);

  const rawRadiusScale = radiusScale.copy().domain(dataRange);

  const _c = c(state);
  const _getDimensionVal = getDimensionVal(state);

  const initialState = _animationState
    ? _animationState
    : _data.nested.map(d => {
        return {
          key: d.key,
          c: _c(d),
          s: d.key,
          range: dataRange,
          alpha: 0,
          strokeAlpha: _options.plots.strokeOpacity,
          values: d.values.map((e, i) => {
            return {
              key: d.key,
              angle: (Math.PI * 2 * i) / d.values.length,
              r: innerRadius,
              r0: innerRadius,
              r1: innerRadius,
              data: e.data,
              d: e,
            };
          }),
        };
      });

  const finalState = _data.nested.map(d => {
    return {
      key: d.key,
      c: _c(d),
      s: d.key,
      range: dataRange,
      alpha: _options.plots.areaOpacity,
      strokeAlpha: _options.plots.strokeOpacity,
      values: d.values.map((e, i) => {
        return {
          key: d.key,
          angle: (Math.PI * 2 * i) / d.values.length,
          r: radiusScale(e.y),
          r0: rawRadiusScale(e.y0),
          r1: rawRadiusScale(e.y1),
          data: e.data,
          d: e,
        };
      }),
    };
  });
  // cache finalState as the initial state of next animation call
  state._animationState = finalState;

  animateStates(
    initialState,
    finalState,
    _options.animation.duration.update,
    _frontContext,
    _options
  ).then(res => {
    state._voronoi = applyVoronoi(
      _frontContext,
      _options,
      res.reduce((acc, p) => {
        acc = acc.concat(
          p.values.map(d => {
            return {
              s: p.key,
              label: _getDimensionVal(d.data),
              metric: d.data[p.key],
              x: d.r * Math.sin(d.angle) + _options.chart.width / 2,
              y:
                _options.chart.height -
                (d.r * Math.cos(d.angle) + _options.chart.height / 2),
              c: p.c,
              d: d,
              data: d.data,
            };
          })
        );
        return acc;
      }, [])
    );

    /**
     * callback for when the mouse moves across the overlay
     */
    function mouseMoveHandler() {
      // get the current mouse position
      const [mx, my] = mouse(this);
      const QuadtreeRadius = 30;
      // use the new diagram.find() function to find the Voronoi site
      // closest to the mouse, limited by max distance voronoiRadius
      const closest = state._voronoi.find(mx, my, QuadtreeRadius);
      if (closest) {
        const fadeOpacity = 0.1;

        const optCopy = Object.assign({}, _options);
        optCopy.plots.levelColor = getTransparentColor(
          optCopy.plots.levelColor,
          fadeOpacity
        );
        optCopy.plots.strokeOpacity = 0;

        drawCanvas(
          _frontContext,
          res.map(d => {
            const p = d;
            p.alpha = d.key === closest.data.s ? 0.4 : fadeOpacity;

            p.strokeAlpha = d.key === closest.data.s ? 1 : 0;

            return p;
          }),
          optCopy
        );

        highlight(_frontContext, _options, closest.data);
      } else {
        drawCanvas(_frontContext, finalState, _options);
      }
    }

    function mouseOutHandler() {
      drawCanvas(_frontContext, finalState, _options);
    }

    state._frontCanvas.on('mousemove', mouseMoveHandler);
    state._frontCanvas.on('mouseout', mouseOutHandler);

    state._listeners.call('rendered');
  });
};

export default animate;
