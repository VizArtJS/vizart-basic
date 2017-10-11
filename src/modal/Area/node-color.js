import { linearStops } from 'vizart-core';

const nodeColor = opt=> {
    const stops = linearStops(opt.color.scheme);
    return stops[stops.length - 1].color;
}

export default nodeColor;