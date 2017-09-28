import { hsl } from 'd3-color';

const transparentColor = d => {
    const color = d.c;
    const hslColorSpace = hsl(color);
    hslColorSpace.opacity = d.alpha;

    return hslColorSpace;
}


const drawCanvas = (context, state)=> {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (const n of state) {
        const color = transparentColor(n);

        for (const b of n.values) {
            context.beginPath();
            context.fillStyle = color;
            context.rect(b.x, b.y, b.w, b.h);
            context.fill();
        }
    }
}

export default drawCanvas;