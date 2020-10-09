const drawMetricOntTop = (context, node, opt) => {
  context.save();

  context.translate(node.x, node.y);
  context.textAlign = 'center';
  // context.textBaseline = 'middle';

  context.fillStyle = opt.plots.metricLabel.color;
  context.fillText(
    node.data[node.key],
    node.w / 2,
    -opt.plots.metricLabel.offset
  );

  context.restore();
};

export default drawMetricOntTop;
