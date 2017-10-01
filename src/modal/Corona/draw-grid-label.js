import { scaleLinear } from 'd3-scale';
import getLevels from './grid-levels';
import isFunction from 'lodash-es/isFunction';


const drawGridLabel = (context, opt, innerRadius, outerRadius, minY, maxY)=> {
    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    const levels = getLevels(opt);

    const labelScale = scaleLinear().domain([0, levels])
        .range([minY, maxY])
        .nice();

    const getLabel = i=> {
        return (opt.plots.levelLabel && isFunction(opt.plots.levelLabel))
            ? opt.plots.levelLabel(labelScale(i))
            : labelScale(i);
    }


    switch (opt.plots.levelLabelPosition) {
        case 'bottom':
            for (let i = 0; i<= levels; i++) {
                context.textAlign = "center";
                context.textBaseline = 'top';
                context.fillStyle = opt.plots.levelLabelColor;
                context.fillText(
                    getLabel(i),
                    0,
                    i * ((outerRadius - innerRadius) / levels) + innerRadius,
                    60);
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
                    getLabel(i),
                    0,
                    -i * ((outerRadius - innerRadius) / levels) - innerRadius,
                    60);
            }

            break;
    }

    context.restore();
}

export default drawGridLabel;