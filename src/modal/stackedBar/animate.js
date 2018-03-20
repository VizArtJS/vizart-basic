import drawHiddenCanvas from './draw-hidden-canvas';
import { mouse } from 'd3-selection';
import animateStates from './tween-states';
import { c } from '../../helper/withStacked';
import { x, getMetric } from '../../helper/withCartesian';
import tooltipMarkup from '../../tooltip/markup';

const animate = state => {
  const {
    _animationState,
    _data,
    _options,
    _frontContext,
    _hiddenContext,
    _canvasScale,
  } = state;
  const _x = x(state);
  const _c = c(state);

  const seriesNum = _data.nested.length;
  const band = _options.data.x.scale.bandwidth();
  const barWidth = band / seriesNum;

  const initialGroupLayout = (d, i) => {
    return {
      key: d.key,
      c: _c(d),
      alpha: _options.plots.opacity,
      values: d.values.map(e => {
        return {
          key: d.key,
          x: _x(e.data) + barWidth * i,
          y: _options.chart.innerHeight,
          w: barWidth,
          h: 0,
          data: e.data,
        };
      }),
    };
  };

  const initialStackLayout = d => {
    return {
      key: d.key,
      c: _c(d),
      alpha: _options.plots.opacity,
      values: d.values.map(e => {
        return {
          key: d.key,
          x: _x(e.data),
          y: getMetric(state).scale(e.y0),
          w: band,
          h: 0,
          data: e.data,
        };
      }),
    };
  };

  const mapGroupLayout = (d, i) => {
    return {
      key: d.key,
      c: _c(d),
      alpha: _options.plots.opacity,
      values: d.values.map(e => {
        return {
          key: d.key,
          x: _x(e.data) + barWidth * i,
          y: e.y,
          w: barWidth,
          h: _options.chart.innerHeight - e.y,
          data: e.data,
        };
      }),
    };
  };

  const mapStackLayout = d => {
    return {
      key: d.key,
      c: _c(d),
      alpha: _options.plots.opacity,
      values: d.values.map(e => {
        return {
          key: d.key,
          x: _x(e.data),
          y: getMetric(state).scale(e.y0),
          w: band,
          h: getMetric(state).scale(e.y1) - getMetric(state).scale(e.y0),
          data: e.data,
        };
      }),
    };
  };

  // stacked => x and width => grouped (y and height)
  const stackToGroup = (d, i) => {
    return {
      key: d.key,
      c: _c(d),
      alpha: _options.plots.opacity,
      values: d.values.map(e => {
        return {
          key: d.key,
          x: _x(e.data) + barWidth * i,
          y: getMetric(state).scale(e.y0),
          w: barWidth,
          h: getMetric(state).scale(e.y1) - getMetric(state).scale(e.y0),
          data: e.data,
        };
      }),
    };
  };

  // grouped => y and height => stacked (x and width)
  const groupToStack = (d, i) => {
    return {
      key: d.key,
      c: _c(d),
      alpha: _options.plots.opacity,
      values: d.values.map(e => {
        return {
          key: d.key,
          x: _x(e.data) + barWidth * i,
          y: getMetric(state).scale(e.y0),
          w: barWidth,
          h: getMetric(state).scale(e.y1) - getMetric(state).scale(e.y0),
          data: e.data,
        };
      }),
    };
  };

  const initialState = _animationState
    ? _animationState
    : _options.plots.stackLayout === true
      ? _data.nested.map(initialStackLayout)
      : _data.nested.map(initialGroupLayout);

  const finalState =
    _options.plots.stackLayout === true
      ? _data.nested.map(mapStackLayout)
      : _data.nested.map(mapGroupLayout);

  if (
    state._alreadyStacked !== undefined &&
    state._alreadyStacked !== null &&
    state._alreadyStacked !== _options.plots.stackLayout
  ) {
    const intrimState =
      _options.plots.stackLayout === false
        ? _data.nested.map(groupToStack)
        : _data.nested.map(stackToGroup);

    animateStates(initialState, intrimState, 500, _frontContext, _options).then(
      () => {
        animate(state);
      }
    );

    state._animationState = intrimState;
    state._alreadyStacked = _options.plots.stackLayout;
  } else {
    animateStates(
      initialState,
      finalState,
      _options.animation.duration.update,
      _frontContext,
      _options
    ).then(res => {
      const colorMap = drawHiddenCanvas(_hiddenContext, res);

      // shadow color?
      /**
       * callback for when the mouse moves across the overlay
       */
      function mouseMoveHandler() {
        // get the current mouse position
        const [mx, my] = mouse(this);
        // This will return that pixel's color
        const col = _hiddenContext.getImageData(
          mx * _canvasScale,
          my * _canvasScale,
          1,
          1
        ).data;
        //Our map uses these rgb strings as keys to nodes.
        const colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
        const closest = colorMap.get(colString);

        if (closest) {
          closest.data[getMetric(state).accessor] = closest.data[closest.key];

          _tooltip
            .html(tooltipMarkup(closest.data.data, state))
            .transition()
            .duration(_options.animation.tooltip)
            .style('left', mx + _options.tooltip.offset[0] + 'px')
            .style('top', my + _options.tooltip.offset[1] + 'px')
            .style('opacity', 1);
        } else {
          _tooltip
            .transition()
            .duration(_options.animation.tooltip)
            .style('opacity', 0);
        }
      }

      function mouseOutHandler() {
        _tooltip
          .transition()
          .duration(_options.animation.tooltip)
          .style('opacity', 0);
      }

      state._frontCanvas.on('mousemove', mouseMoveHandler);
      state._frontCanvas.on('mouseout', mouseOutHandler);

      state._listeners.call('rendered');
    });

    // cache finalState as the initial state of next animation call
    state._animationState = finalState;
    state._alreadyStacked = _options.plots.stackLayout;
  }
};

export default animate;
