import genColorByIndex from '../../canvas/generate-color';
import nodeColor from './node-color';

const drawPoints = (context, particles, opt, hidden)=> {
    for (const [i, p] of particles.entries()) {
        context.beginPath();
        context.fillStyle = hidden === true? genColorByIndex(i) : nodeColor(opt);
        context.globalAlpha = p.alpha;
        context.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        context.fill();
    }
}

export default drawPoints;