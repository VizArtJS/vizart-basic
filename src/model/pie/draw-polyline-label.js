import getLinePosition from './get-line-position';

const drawPolyLine = (context, slice, centroid, opt) => {
  const start = centroid;
  const end = getLinePosition(centroid, slice, opt.plots.labelOffset);

  context.save();
  context.beginPath();
  context.strokeStyle = slice.data.c;
  context.strokeWidth = 4;

  context.moveTo(start[0], start[1]);
  context.lineTo(end[0], end[1]);
  context.stroke();

  context.translate(end[0], end[1]);
  context.textAlign = end[0] > start[0] ? 'start' : 'end';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';
  context.fillText(
    slice.data.label + ': ' + slice.data.p,
    end[0] > start[0] ? 5 : -5,
    0
  );
  context.restore();
};

export default drawPolyLine;
