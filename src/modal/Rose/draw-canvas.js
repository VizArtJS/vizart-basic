import { arc } from 'd3-shape';

const drawCanvas = (context, state, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for(const d of state) {
        context.save();

        const gridArc = arc()
            .innerRadius(0)
            .outerRadius(d=>d.r)
            .context(context);

        gridArc(d.values);

        context.restore();
    }

}

export default drawCanvas;