import { hsl } from 'd3-color';

const transparentColor = (c, alpha) => {
    const hslColorSpace = hsl(c);
    hslColorSpace.opacity = alpha;

    return hslColorSpace;
}

export default transparentColor;