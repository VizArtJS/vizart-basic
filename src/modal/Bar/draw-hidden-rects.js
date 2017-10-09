import { select } from 'd3-selection';
import genColorByIndex from '../../canvas/helper/generate-color';

const drawHiddenRects =  (context, selection)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const colorMap = new Map();

    selection.each(function(d, i){
        context.save();

        const node = select(this);
        const color = genColorByIndex(i + 1);
        context.beginPath();
        context.fillStyle = color;
        context.rect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'));
        context.fill();

        context.restore();

        colorMap.set(color, d);
    });

    return colorMap;
}

export default drawHiddenRects;