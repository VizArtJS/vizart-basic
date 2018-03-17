import {
    apiRenderCanvas,
    apiUpdate,
    canvas,
    genericColor
} from 'vizart-core';

import createCartesianOpt from '../options/createCartesianOpt';
import { processCartesianData } from '../data';
import { renderAxis, updateAxis } from '../axis';

const colorComposer = (colorOpt, data, opt) =>
    genericColor(colorOpt, data.map(d => d[opt.data.y[0].accessor]));

const apiRender = (state, animate, hasAxis) => ({
    render(data) {
        apiRenderCanvas(state).render(data);
        if (hasAxis === true) {
            renderAxis(state);
        }
        animate(state);
    },
});

const apiUpdateChart = (state, animate, hasAxis) => ({
    update() {
        apiUpdate(state).update();
        if (hasAxis === true) {
            updateAxis(state);
        }
        animate(state);
    },
});

const apiColor = (state, animate, hasAxis) => ({
    color(colorOpt) {
        state._options.color = colorOpt;
        apiUpdate(state).update();
        if (hasAxis === true) {
            updateAxis(state);
        }
        animate(state);
    },
});

const build = (ChartOpt, animate, hasAxis = true) => (id, opt) => {
    const composers = {
        opt: opt => createCartesianOpt(ChartOpt, opt),
        data: processCartesianData,
        color: colorComposer,
    };

    const baseChart = canvas(id, opt, composers);

    return Object.assign(
        baseChart,
        apiRender(baseChart, animate, hasAxis),
        apiUpdateChart(baseChart, animate, hasAxis),
        apiColor(baseChart, animate, hasAxis)
    );
};

export default build;
