import {
    apiRenderCanvas,
    apiUpdate,
    canvas,
    categoricalColor,
} from 'vizart-core';
import createCartesianStackedOpt from "../options/createCartesianStackedOpt";
import {processStackedData} from "../data";

const colorBySeries = (colorOpt, data, opt) => {
    const distinct = data && data.nested ? data.nested.length : 0;
    return categoricalColor(opt.color.scheme, distinct);
};

const apiRender = (state, animate) => ({
    render(data) {
        apiRenderCanvas(state).render(data);
        animate(state);
    },
});

const apiUpdateChart = (state, animate) => ({
    update() {
        apiUpdate(state).update();
        animate(state);
    },
});

const apiColor = (state, animate) => ({
    color(colorOpt) {
        state._options.color = colorOpt;
        apiUpdate(state).update();
        animateCorona(state);
    },
});

const build = (ChartOpt, animate)=> (id, opt)=> {
    const composers = {
        opt: opt => createCartesianStackedOpt(ChartOpt, opt),
        data: processStackedData,
        color: colorBySeries,
    };

    const baseChart = canvas(id, opt, composers);

    return Object.assign(
        baseChart,
        apiRender(baseChart, animate),
        apiUpdateChart(baseChart, animate),
        apiColor(baseChart, animate),
    );
}

export default build;