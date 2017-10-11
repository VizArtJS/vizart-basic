import { scaleLinear } from 'd3-scale';
import { format } from 'd3-format';
import isFunction from 'lodash-es/isFunction';

import getLevels from './get-grid-levels';
import getRadius from "./get-radius";

const formatter = format(".1f");

const drawGridLabel = (context, state, opt)=> {
    if (state.length <= 0) {
        return;
    }

    const [innerRadius, outerRadius] = getRadius(opt);

    context.save();
    context.translate(opt.chart.width / 2, opt.chart.height / 2);

    const levels = getLevels(opt);

    const labelScale = scaleLinear().domain([0, levels])
        .range(state[0].range)
        .nice();

    const getLabel = i=> {
        const label = (labelScale(i) > 0 && labelScale(i) < 1 )
            ? formatter(labelScale(i))
            : Math.round(labelScale(i));

        return (opt.plots.levelLabel && isFunction(opt.plots.levelLabel))
            ? opt.plots.levelLabel(label)
            : label;
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
                    i * ((outerRadius - innerRadius) / levels) + innerRadius);
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
                    -i * ((outerRadius - innerRadius) / levels) - innerRadius);
            }

            break;
    }

    context.restore();
}

export default drawGridLabel;