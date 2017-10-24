import animateStates from './tween-states';

const drawBloomingRose = (initialState, finalState, context, opt)=> {
    const bloom = i=> {
        let _init = finalState.slice(0, i+1);
        const _target = finalState.slice(0, i+1);
        _init[i] = initialState[i];

        return animateStates(_init,
            _target,
            350,
            context,
            opt);
    }

    finalState.reduce((acc, cur, i)=> {
            return acc = acc.then(res=> bloom(i))
        }, Promise.resolve());
}

export default drawBloomingRose;