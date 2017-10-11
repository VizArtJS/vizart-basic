import { genColorByIndex } from 'vizart-core';
import nodeColor from './node-color';

const drawPoints = (context, particles, opt, hidden)=> {
    for (const [i, p] of particles.entries()) {
        context.save();

        context.beginPath();
        context.fillStyle = hidden === true? genColorByIndex(i) : nodeColor(opt);
        context.globalAlpha = p.alpha;
        context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        context.fill();

        context.restore();
    }
}

export default drawPoints;