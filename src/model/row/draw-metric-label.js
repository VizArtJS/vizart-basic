const drawMetricLabel = (context, node, opt) => {
  if (node.attr('metric')) {
    context.save();

    context.translate(node.attr('x'), node.attr('y'));

    context.textBaseline = 'middle';
    context.fillStyle = opt.plots.metricLabel.color;
    context.lineWidth = 4;

    if (+node.attr('metric') < 0) {
      context.textAlign = 'end';
      context.fillText(
        node.attr('metric'),
        -opt.plots.metricLabel.offset,
        node.attr('height') / 2
      );
    } else {
      context.textAlign = 'start';
      context.fillText(
        node.attr('metric'),
        +node.attr('width') + opt.plots.metricLabel.offset,
        +node.attr('height') / 2
      );
    }

    context.restore();
  }
};

export default drawMetricLabel;
