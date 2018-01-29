const drawControlPoint = (context, slice, centroid, opt) => {
  context.save();

  context.beginPath();
  context.fillStyle = slice.data.c;
  context.globalAlpha = slice.data.alpha;
  context.arc(
    centroid[0],
    centroid[1],
    opt.plots.labelControlPointRadius,
    0,
    2 * Math.PI,
    false
  );
  context.fill();

  context.strokeStyle = 'white';
  context.strokeWidth = 4;
  context.stroke();
  context.closePath();

  context.restore();
};

export default drawControlPoint;
