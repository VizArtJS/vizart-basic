import isUndefined from 'lodash-es/isUndefined';
import isFunction from 'lodash-es/isFunction';

import { cartesian } from '../../helper/builder';
import animate from './animate';

import { updateAxis } from '../../axis';

import sortSelector from '../../data/helper/sort-selector';
import drawRects from './draw-rects';

const BarOpt = {
  chart: { type: 'bar' },
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
  },
};

class Bar extends AbstractBasicCartesianChartWithAxes {
  constructor(canvasId, _userOptions) {
    super(canvasId, _userOptions);

    this._w = () => {
      if (
        isUndefined(this._getDimension().scale.bandwidth) ||
        !isFunction(this._getDimension().scale.bandwidth)
      ) {
        let evenWidth = Math.ceil(
          this._options.chart.innerWidth / this._data.length
        );

        return evenWidth > 1 ? evenWidth - 1 : 0.1;
      } else {
        return this._getDimension().scale.bandwidth();
      }
    };
    this._h = d => this._options.chart.innerHeight - this._y(d);
    this._zero = () => this._getMetric().scale(0);
  }

  sortDetached() {
    this._detachedContainer
      .selectAll('.bar')
      .transition()
      .duration(this._options.animation.duration.update)
      .delay(
        (d, i) =>
          i / this._data.length * this._options.animation.duration.update
      )
      .attr('x', this._x);
  }

  sort(field, direction) {
    this._options.ordering = {
      accessor: field,
      direction: direction,
    };

    this._data = super.data(this._data);
    sortSelector(this._detachedContainer.selectAll('.bar'), this._options);

    const drawCanvasInTransition = () => {
      return t => {
        drawRects(
          this._frontContext,
          this._detachedContainer.selectAll('.bar'),
          this._options
        );
      };
    };

    this._detachedContainer
      .selectAll('.bar')
      .transition()
      .duration(this._options.animation.duration.update)
      .delay(
        (d, i) =>
          i / this._data.length * this._options.animation.duration.update
      )
      .attr('x', this._x)
      .tween('append.rects', drawCanvasInTransition);

    updateAxis(this._svg, this._data, this._options);
  }
}

const bar = cartesian(cartesian, animate);

export default Bar;
