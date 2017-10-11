const drawCanvas = (context, particles, opt)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (const p of particles) {
        context.save();

        context.beginPath();
        context.fillStyle = p.c;
        context.globalAlpha = p.alpha;
        context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        context.fill();

        context.restore();
    }
}

export default drawCanvas;