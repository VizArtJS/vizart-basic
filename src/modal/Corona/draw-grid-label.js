import { scaleLinear } from 'd3-scale';
import getLevels from './grid-levels';

const drawGridLabel = (context, innerRadius, outerRadius, opt, minY, maxY)=> {
    const levels = getLevels(opt);

    const labelScale = scaleLinear().domain([0, levels])
        .range([ maxY, minY])
        .nice();

    for (let i = 0; i<= levels; i++) {
        context.textAlign = "center";
        context.textBaseline = 'ideographic';
        context.fillStyle = opt.plots.levelLabelColor;
        context.fillText(
            labelScale(i),
            4,
            -i * ((outerRadius - innerRadius) / levels) - innerRadius,
            30);
    }
}

export default drawGridLabel;