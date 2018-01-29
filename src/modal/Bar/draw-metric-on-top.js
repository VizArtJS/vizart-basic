const drawMetricOntTop = (context, node, opt) => {
  context.save();

  context.translate(node.attr('x'), node.attr('y'));
  context.textAlign = 'center';
  // context.textBaseline = 'middle';

  context.fillStyle = opt.plots.metricLabel.color;
  context.fillText(
    node.attr('metric'),
    node.attr('width') / 2,
    -opt.plots.metricLabel.offset
  );

  context.restore();
};

export default drawMetricOntTop;
