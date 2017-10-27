import { interpolateArray } from 'd3-interpolate';
import { timer } from 'd3-timer';
import { easeCubic } from 'd3-ease';

import drawCanvas from './draw-canvas';

const animateStates = (initialState, finalState, duration, context, opt)=> {
    if (opt.animation.enabled === false) {
        return new Promise((resolve, reject)=> {
            drawCanvas(context, finalState, opt);

            resolve(finalState);
        });
    } else {
        return new Promise((resolve, reject)=> {
            const interpolateParticles = interpolateArray(initialState, finalState);

            const batchRendering = timer( (elapsed)=> {
                const t = Math.min(1, easeCubic(elapsed / duration));

                drawCanvas(context,
                    interpolateParticles(t),
                    opt);

                if (t === 1) {
                    batchRendering.stop();
                    // final state as result
                    resolve(finalState);
                }
            });
        });
    }

}

export default animateStates;