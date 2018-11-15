import { mouse, event } from 'd3-selection';
import { transition } from 'd3-transition';
import { scaleBand, scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { axisBottom } from 'd3-axis';

import { brushY } from 'd3-brush';

import { Globals, mergeOptions, uuid } from 'vizart-core';

import AbstractBasicCartesianChart from '../../base/AbstractBasicCartesianChart';
import createCartesianOpt from '../../options/createCartesianOpt';
import drawCanvas from './draw-canvas';
import drawHiddenRects from './draw-hidden-rects';
import tickRange from '../../data/update-scale/ticks';
import brushResizePath from '../../util/brush-handle';

const DefaultOpt = {
  chart: { type: 'row' },
  plots: {
    barLabel: {
      enabled: false,
      color: 'black',
    },
    metricLabel: {
      enabled: false,
      color: 'black',
      offset: 10,
    },

    enableMiniBar: true,
    miniBarWidth: 50,
  },
};

const miniWidth = opt => opt.chart.width - opt.plots.miniBarWidth;

const BottomAxisOffset = 10;
const InitialBrushHeight = 200;

const forceMetricDesc = userOpt => {
  userOpt.ordering = {
    accessor: userOpt.data.y[0].accessor,
    direction: 'desc',
  };
};

class Row extends AbstractBasicCartesianChart {
  constructor(canvasId, userOpt) {
    forceMetricDesc(userOpt);

    super(canvasId, userOpt);
  }

  _animate() {
    this._getDimension().scale.range([0, this._options.chart.innerHeight]);

    if (this._options.plots.enableMiniBar === true) {
      this.drawMiniSvg(this._data);
      this.drawMainBars(
        this._data.filter(d => this._x(d) < InitialBrushHeight)
      );
    } else {
      this.drawMainBars(this._data);
      this.updateAxis(this._data);
    }
  }

  drawMiniSvg(data) {
    const width = this._options.plots.miniBarWidth;
    const height = this._options.chart.innerHeight;

    const miniX = miniWidth(this._options);
    this._container.select('.mini-group').remove();

    this.miniSvg = this._container
      .append('g')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'mini-group')
      .attr(
        'transform',
        'translate(' + miniX + ',' + this._options.chart.margin.top + ')'
      );

    const miniXScale = scaleBand()
      .domain(data.map(d => this._getDimensionVal(d)))
      .range([0, this._options.chart.innerHeight - BottomAxisOffset - 5])
      .paddingInner(0.1);
    const miniYScale = scaleLinear()
      .domain(extent(data, this._getMetricVal))
      .range([0, this._options.plots.miniBarWidth]);

    const h = miniXScale.bandwidth();
    const y = d => miniYScale(this._getMetricVal(d));
    const x = d => miniXScale(this._getDimensionVal(d));

    const dataUpdate = this.miniSvg.selectAll('.mini').data(data);
    const dataJoin = dataUpdate.enter();
    const dataRemove = dataUpdate.exit();

    dataRemove.remove();
    dataUpdate
      .attr('width', y)
      .attr('y', x)
      .attr('height', h);
    dataJoin
      .append('rect')
      .attr('class', 'mini')
      .attr('fill', '#e0e0e0')
      .attr('opacity', 1)
      .attr('x', 0)
      .attr('y', x)
      .attr('height', h)
      .attr('width', y);

    this.brushGroup = this.miniSvg.append('g').attr('class', 'brush');

    const brush = brushY().extent([
      [0, 0],
      [miniX, this._options.chart.innerHeight],
    ]);

    const handleOffset =
      -this._options.plots.miniBarWidth - this._options.plots.miniBarWidth / 4;

    const handle = this.brushGroup
      .selectAll('.custom-handle')
      .data([{ type: 'w' }, { type: 'e' }])
      .enter()
      .append('path')
      .attr('class', 'custom-handle')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('cursor', 'ns-resize')
      .attr('d', brushResizePath(this._options.plots.miniBarWidth))
      .attr('transform', 'rotate(90) translate(0,' + handleOffset + ')');

    const brushMove = () => {
      const s = event.selection;

      if (s === null) {
        handle.attr('display', 'none');
      } else {
        handle
          .attr('display', null)
          .attr(
            'transform',
            (d, i) => 'rotate(90) translate(' + [s[i], handleOffset] + ')'
          );
      }

      this.miniSvg
        .selectAll('.mini')
        .attr('fill', d => {
          const metric = this._getMetricVal(d);

          if (s[0] <= (d = x(d)) && d <= s[1]) {
            return metric > 0 ? '#addd8e' : '#fdbb84';
          } else {
            return '#e0e0e0';
          }
        })
        .classed('selected', d => s[0] <= (d = x(d)) && d <= s[1]);

      const data = this.miniSvg.selectAll('.selected').data();
      this.drawMainBars(data);
      this.updateAxis(data);
    };

    brush.on('start brush end', brushMove);

    this.brushGroup.call(brush);
    this.brushGroup.call(brush.move, [0, InitialBrushHeight]);
  }

  _makeMetricScale(data) {
    const yExtent = extent(data, this._getMetricVal);

    let tickedRange;
    if (yExtent[1] <= 0 || yExtent[0] >= 0) {
      // only negative or only positive
      tickedRange = tickRange(
        yExtent,
        this._options.yAxis[0].ticks,
        this._options.yAxis[0].tier
      );
    } else {
      // both positive and negative
      const boundary = Math.max(Math.abs(yExtent[0]), yExtent[1]);
      tickedRange = tickRange(
        [-boundary, boundary],
        this._options.yAxis[0].ticks,
        this._options.yAxis[0].tier
      );
    }

    const mainWidth =
      this._options.chart.innerWidth - this._options.plots.miniBarWidth;

    return scaleLinear()
      .domain([tickedRange[0], tickedRange[1]])
      .range([0, mainWidth]);
  }

  updateAxis(data) {
    const bottomAxis = axisBottom().scale(this._makeMetricScale(data));

    if (!this.bottomAxis) {
      this.bottomAxis = this._container
        .append('g')
        .attr('class', 'x axis')
        .attr(
          'transform',
          'translate(' +
            this._options.chart.margin.left +
            ',' +
            (this._options.chart.innerHeight + BottomAxisOffset) +
            ')'
        );
    }

    this.bottomAxis.call(bottomAxis);
    this.bottomAxis.select('.domain').style('opacity', 0);

    this._container
      .select('.x.axis')
      .transition()
      .duration(50)
      .call(bottomAxis);
  }

  drawMainBars(data) {
    const drawCanvasInTransition = () => {
      return t => {
        drawCanvas(
          this._frontContext,
          this._detachedContainer.selectAll('.bar'),
          this._options
        );
      };
    };

    const xScale = scaleBand()
      .domain(data.map(d => this._getDimensionVal(d)))
      .range([0, this._options.chart.innerHeight - BottomAxisOffset - 5])
      .paddingInner(0.1);

    const yScale = this._makeMetricScale(data);
    const mainWidth =
      this._options.plots.enableMiniBar === true
        ? this._options.chart.innerWidth - this._options.plots.miniBarWidth
        : this._options.chart.innerWidth;

    const h = xScale.bandwidth();
    const x = d => xScale(this._getDimensionVal(d));
    let w;
    let y;
    let colorScale = this._color.copy().domain(yScale.domain());

    const yExtent = extent(data, this._getMetricVal);

    if (yExtent[0] >= 0) {
      w = d => yScale(this._getMetricVal(d));
      y = d => yScale(0);

      if (this._options.color.type === 'divergent') {
        colorScale.domain([-yScale.domain()[1], Math.abs(yScale.domain()[1])]);
      }
    } else if (yExtent[1] <= 0) {
      w = d => mainWidth - yScale(this._getMetricVal(d));
      y = d => yScale(this._getMetricVal(d));

      if (this._options.color.type === 'divergent') {
        colorScale.domain([yScale.domain()[0], Math.abs(yScale.domain()[0])]);
      }
    } else {
      w = d => Math.abs(mainWidth / 2 - yScale(this._getMetricVal(d)));
      y = d =>
        this._getMetricVal(d) > 0 ? mainWidth / 2 : mainWidth / 2 - w(d);
    }

    const c = d => colorScale(this._getMetricVal(d));

    const dataUpdate = this._detachedContainer.selectAll('.bar').data(data);
    const dataJoin = dataUpdate.enter();
    const dataRemove = dataUpdate.exit();

    const exitTransition = transition()
      .duration(this._options.animation.duration.remove)
      .each(() => {
        dataRemove
          .transition()
          .attr('width', 0)
          .tween('remove.rects', drawCanvasInTransition);

        dataRemove.remove();
      });

    const updateTransition = exitTransition
      .transition()
      .duration(this._options.animation.duration.update)
      .each(() => {
        dataUpdate
          .attr('dimension', this._getDimensionVal)
          .attr('metric', this._getMetricVal)
          .transition('update-rect-transition')
          .delay(
            (d, i) =>
              (i / this._data.length) * this._options.animation.duration.update
          )
          .attr('fill', c)
          .attr('x', y)
          .attr('width', w)
          .attr('y', x)
          .attr('height', h)
          .tween('update.rects', drawCanvasInTransition);
      });

    const enterTransition = updateTransition
      .transition()
      .duration(this._options.animation.duration.update)
      .each(() => {
        dataJoin
          .append('rect')
          .attr('class', 'bar')
          .attr('fill', c)
          .attr('opacity', 1)
          .attr('x', y)
          .attr('y', x)
          .attr('width', 0)
          .attr('dimension', this._getDimensionVal)
          .attr('metric', this._getMetricVal)
          .attr('height', h)
          .transition()
          .delay(
            (d, i) =>
              (i / this._data.length) * this._options.animation.duration.update
          )
          .attr('width', w)
          .tween('append.rects', drawCanvasInTransition);
      });

    const that = this;
    enterTransition.on('end', () => {
      const colorMap = drawHiddenRects(
        this._hiddenContext,
        this._detachedContainer.selectAll('.bar')
      );

      // shadow color?
      /**
       * callback for when the mouse moves across the overlay
       */
      function mouseMoveHandler() {
        // get the current mouse position
        const [mx, my] = mouse(this);
        // This will return that pixel's color
        const col = that._hiddenContext.getImageData(
          mx * that._canvasScale,
          my * that._canvasScale,
          1,
          1
        ).data;
        //Our map uses these rgb strings as keys to nodes.
        const colString = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
        const node = colorMap.get(colString);

        if (node) {
          that._tooltip
            .html(that.tooltip(node))
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
    });
  }

  options(userOpt) {
    if (userOpt) {
      forceMetricDesc(userOpt);
    }

    return super.options(userOpt);
  }

  createOptions(_userOptions) {
    return createCartesianOpt(DefaultOpt, _userOptions);
  }
}

export default Row;
