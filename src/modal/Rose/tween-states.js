import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { easeCubic } from 'd3-ease';
import drawCanvas from './draw-canvas';

const animateStates = (initialState, finalState, duration, context, opt)=> {
    return new Promise((resolve, reject)=> {
        const interpolateParticles = interpolateArray(initialState, finalState);

        const batchRendering = timer( (elapsed)=> {
            const t = Math.min(1, easeCubic(elapsed / duration));

            drawCanvas(context, interpolateParticles(t), opt);

            if (t === 1) {
                batchRendering.stop();
                console.log('stop ani')
                resolve(interpolateParticles(t));
            }
        });
    });
}

export default animateStates;