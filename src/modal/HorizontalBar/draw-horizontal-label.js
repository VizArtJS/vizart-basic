const drawHorizontalLabel = (context, node, opt)=> {
    context.save();

    context.translate(node.attr('x'), node.attr('y'));
    context.textAlign = "bottom";
    context.textBaseline = 'middle';

    context.strokeStyle = 'rgba(255,255,255, 0.7)';
    context.lineWidth = 4;
    context.strokeText(node.attr('dimension'), 5, node.attr('height') / 2);

    context.fillStyle = opt.plots.barLabel.color;
    context.fillText(node.attr('dimension'), 5, node.attr('height') / 2);

    context.restore();
}

export default drawHorizontalLabel;