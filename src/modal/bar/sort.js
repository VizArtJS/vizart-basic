import sortSelector from '../../data/helper/sort-selector';
import drawRects from './draw-rects';
import { updateAxis } from '../../axis';

const apiSort = state => ({
  sort: (field, direction) => {
    const { _options, _detachedContainer, _frontContext } = state;
    state._options.ordering = {
      accessor: field,
      direction: direction,
    };

    state.data(this._data);
    sortSelector(this._detachedContainer.selectAll('.bar'), this._options);

    const drawCanvasInTransition = () => {
      return t => {
        drawRects(
          _frontContext,
          _detachedContainer.selectAll('.bar'),
          _options
        );
      };
    };

    state._detachedContainer
      .selectAll('.bar')
      .transition()
      .duration(_options.animation.duration.update)
      .delay((d, i) => i / _data.length * _options.animation.duration.update)
      .attr('x', _x)
      .tween('append.rects', drawCanvasInTransition);

    updateAxis(state, false);
  },
});

export default apiSort;
