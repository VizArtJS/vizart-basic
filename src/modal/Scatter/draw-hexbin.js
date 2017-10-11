import hexbinLayout from './hexbin-layout';


const drawHexbin = (context, particles, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const hexLayout = hexbinLayout()
        .x(d=>d.x)
        .y(d=>d.y)
        .size([context.canvas.width, context.canvas.height])
        .radius(20);
    hexLayout.context(context);
    const hexagons = hexLayout(particles);

    for (const h of hexagons) {
        context.save();
        context.fillStyle = 'red';
        context.translate(h.x, h.y);
        hexLayout.hexagon(20);
        context.fill();
        context.restore();
    }

}

export default drawHexbin;