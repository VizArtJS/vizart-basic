import sortSelector from '../../data/helper/sort-selector';
import drawRects from './draw-rects';
import { updateAxis } from '../../axis';
import { x } from '../../helper/withCartesian';

const apiSort = state => ({
  sort: (field, direction) => {
    const { _options, _detachedContainer, _frontContext, _data } = state;
    const _x = x(state);

    state._options.ordering = {
      accessor: field,
      direction: direction,
    };

    state.data(_data);
    sortSelector(_detachedContainer.selectAll('.bar'), _options);

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
