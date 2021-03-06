const drawVerticalLabel = (context, node, opt) => {
  if (node.attr('dimension')) {
    context.save();

    context.translate(node.attr('x'), opt.chart.innerHeight);
    context.rotate(-Math.PI / 2);
    context.textAlign = 'bottom';
    context.textBaseline = 'middle';

    context.strokeStyle = 'rgba(255,255,255, 0.7)';
    context.lineWidth = 4;
    context.strokeText(node.attr('dimension'), 5, node.attr('width') / 2);

    context.fillStyle = opt.plots.barLabel.color;
    context.fillText(node.attr('dimension'), 5, node.attr('width') / 2);

    context.restore();
  }
};

export default drawVerticalLabel;
