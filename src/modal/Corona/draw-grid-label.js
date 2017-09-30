import { scaleLinear } from 'd3-scale';
import getLevels from './grid-levels';

const drawGridLabel = (context, opt, innerRadius, outerRadius, minY, maxY)=> {
    const levels = getLevels(opt);

    const labelScale = scaleLinear().domain([0, levels])
        .range([ maxY, minY])
        .nice();

    switch (opt.plots.levelLabelPosition) {
        case 'bottom':
            for (let i = 0; i<= levels; i++) {
                context.textAlign = "center";
                context.textBaseline = 'top';
                context.fillStyle = opt.plots.levelLabelColor;
                context.fillText(
                    labelScale(i),
                    0,
                    i * ((outerRadius - innerRadius) / levels) + innerRadius,
                    30);
            }

            break;
        case 'right':
        case 'top':
        default:
            for (let i = 0; i<= levels; i++) {
                context.textAlign = "center";
                context.textBaseline = 'ideographic';
                context.fillStyle = opt.plots.levelLabelColor;
                context.fillText(
                    labelScale(i),
                    0,
                    -i * ((outerRadius - innerRadius) / levels) - innerRadius,
                    30);
            }

            break;
    }

}

export default drawGridLabel;