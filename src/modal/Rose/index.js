import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { arc } from 'd3-shape';
import { mouse } from 'd3-selection';

import { AbstractStackedCartesianChart } from '../../base';
import createCartesianStackedOpt from '../../options/createCartesianStackedOpt';
import animateStates from './tween-states';

import drawPetal from './draw-petal';
import getRadius from './get-radius';
import getOrderedDimensions from './get-ordered-dimensions';
import drawHiddenCanvas from './draw-hidden-canvas';

const RoseOpt = {
  chart: {
    type: 'rose',
  },

  plots: {
    innerRadiusRatio: 0.4,
    opacity: 0.5,
    outerRadiusMargin: 10,
    padAngle: 0.04,
    axisLabel: null,
    axisLabelAlign: true,
    axisLabelAlignThreshold: 0.5,
    axisLabelOffset: 10,
    axisLabelColor: 'black',
    dimensionOrder: null,
  },
};

/**
 *
 *"Death is a great price to pay for a red rose," cried the Nightingale,
 * "and Life is very dear to all. It is pleasant to sit in the green wood,
 * and to watch the Sun in his chariot of gold, and the Moon in her chariot of pearl.
 * Sweet is the scent of the hawthorn, and sweet are the bluebells that hide in the valley,
 * and the heather that blows on the hill. Yet love is better than Life, and what is the heart
 * of a bird compared to the heart of a man?"
 *
 * @author Oscar Wilde <The Nightingale And The Rose>
 */
class Rose extends AbstractStackedCartesianChart {
  constructor(canvasId, _userOptions) {
    super(canvasId, _userOptions);
  }

  _animate() {
    const colorScale = scaleOrdinal().range(this._color.range());
    const c = d => colorScale(d);
    const innerRadius = getRadius(this._options)[0];
    const outerRadius = getRadius(this._options)[1];

    // y is area
    // https://understandinguncertainty.org/node/214
    const area = r => Math.PI * Math.pow(r, 2) / 3;
    const radiusOfArea = area => Math.sqrt(area * 3 / Math.PI);

    const radiusScale = scaleLinear()
      .domain([0, radiusOfArea(this._data.maxY)])
      .range([innerRadius, outerRadius]);

    const r = d => radiusScale(radiusOfArea(d));

    const sliceNum = this._getDimension().values.length;
    const angleScale = scaleLinear()
      .domain([0, sliceNum])
      .range([0, 2 * Math.PI]);

    const dimensions = getOrderedDimensions(
      this._options,
      this._getDimension().values
    );
    const finalState = dimensions.map((d, i) => {
      let array = this._data.nested.map(e => {
        const _c = this._options.data.y.length > 1 ? c(e.key) : c(d);

        return {
          key: e.key,
          s: e.key,
          c: _c,
          alpha: this._options.plots.opacity,
          startAngle: angleScale(i),
          endAngle: angleScale(i + 1),
          r0: innerRadius,
          r: r(e.values[i]._y),
          data: e.values[i],
        };
      });

      // larger slice are drawn first
      array.sort((a, b) => b.r - a.r);

      return {
        dimension: d,
        i: i,
        slice: array,
      };
    });

    const that = this;
    const ctx = that._frontContext;
    const opt = that._options;

    const enableMouse = () => {
      const colorMap = drawHiddenCanvas(that._hiddenContext, finalState, opt);

      function mouseMoveHandler() {
        // get the current mouse position
        const [mx, my] = mouse(this);
        const col = that._hiddenContext.getImageData(
          mx * that._canvasScale,
          my * that._canvasScale,
          1,
          1
        ).data;
        const colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
        const node = colorMap.get(colString);

        if (node) {
          const html = that.tooltip(node.data.data);

          that._tooltip
            .html(html)
            .transition()
            .duration(that._options.animation.tooltip)
            .style('left', mx + that._options.tooltip.offset[0] + 'px')
            .style('top', my + that._options.tooltip.offset[1] + 'px')
            .style('opacity', 1);
        } else {
          that._tooltip
            .transition()
            .duration(that._options.animation.tooltip)
            .style('opacity', 0);
        }
      }

      function mouseOutHandler() {
        that._tooltip
          .transition()
          .duration(that._options.animation.tooltip)
          .style('opacity', 0);
      }

      that._frontCanvas.on('mousemove', mouseMoveHandler);
      that._frontCanvas.on('mouseout', mouseOutHandler);

      that._listeners.call('rendered');
    };

    if (!this.previousState && finalState.length < 30) {
      const drawCanvasInTransition = function(d, i) {
        return t => {
          drawPetal(
            ctx,
            that._detachedContainer.selectAll('.petal-group'),
            opt,
            sliceNum
          );
        };
      };

      this._detachedContainer.attr(
        'transform',
        'translate(' +
          (opt.chart.margin.left + opt.chart.innerWidth / 2) +
          ',' +
          (opt.chart.margin.top + opt.chart.innerHeight / 2) +
          ')'
      );

      const dataUpdate = this._detachedContainer
        .selectAll('.petal-group')
        .data(finalState);
      const dataJoin = dataUpdate.enter();

      const arcDiagram = arc()
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle)
        .innerRadius(innerRadius)
        .outerRadius(d => d.r)
        .padAngle(opt.padAngle || 0);

      const groups = dataJoin
        .append('g')
        .attr('class', 'petal-group')
        .attr('scale', 0)
        .attr('transform', 'scale(0,0)');

      groups
        .selectAll('.petal')
        .data(d => d.slice)
        .enter()
        .append('path')
        .attr('class', 'petal')
        .attr('series', d => d.s)
        .attr('dimension', d => this._getDimensionVal(d.data.data))
        .attr('r', d => d.r)
        .attr('d', arcDiagram)
        .attr('fill', d => d.c)
        .attr('opacity', d => d.alpha);

      groups
        .transition()
        .delay(500)
        .duration((d, i) => 150 * i)
        .attr('scale', 1)
        .attr('transform', 'scale(1,1)')
        .tween('blooming.petal', drawCanvasInTransition)
        .on('end', () => {
          enableMouse();
        });
    } else {
      animateStates(
        this.previousState,
        finalState,
        opt.animation.duration.update,
        ctx,
        opt
      ).then(res => {
        enableMouse();
      });
    }

    this.previousState = finalState;
  }

  createOptions(_userOpt) {
    return createCartesianStackedOpt(RoseOpt, _userOpt);
  }
}

export default Rose;
