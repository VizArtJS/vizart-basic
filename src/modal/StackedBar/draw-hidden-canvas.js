import { genColorByIndex } from 'vizart-core';

const drawHiddenCanvas = (context, state) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  const colorMap = new Map();

  let i = 0;
  for (const n of state) {
    for (const b of n.values) {
      const color = genColorByIndex(++i);

      context.beginPath();
      context.fillStyle = color;
      context.rect(b.x, b.y, b.w, b.h);
      context.fill();

      colorMap.set(color, b);
    }
  }

  return colorMap;
};

export default drawHiddenCanvas;
