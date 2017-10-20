const TextOffset = 5;

const drawHorizontalLabel = (context, node, opt)=> {
    if (node.attr('dimension')) {
        context.save();

        context.translate(node.attr('x'), node.attr('y'));

        context.textBaseline = 'middle';
        context.strokeStyle = 'rgba(255,255,255, 0.7)';
        context.fillStyle = opt.plots.barLabel.color;
        context.lineWidth = 4;

        if (+node.attr('metric') < 0) {
            context.textAlign = "end";

            context.strokeText(node.attr('dimension'),  node.attr('width') - TextOffset, node.attr('height') / 2);
            context.fillText(node.attr('dimension'), node.attr('width') - TextOffset, node.attr('height') / 2);
        } else {

            context.textAlign = "bottom";
            context.strokeText(node.attr('dimension'), TextOffset, node.attr('height') / 2);
            context.fillText(node.attr('dimension'), TextOffset, node.attr('height') / 2);
        }


        context.restore();
    }
}

export default drawHorizontalLabel;