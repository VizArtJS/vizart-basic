const tooltipMarkup = (d, state) =>
  `
    <div class="tooltip-content" style="border-color: ${state._c(d)};">
        <div class="tooltip-header">${state._getDimensionVal(d)}</div>
        <div class="tooltip-row">
            <div class="col">${state._getMetric().name} </div>
            <div class="col">${state._getMetricVal(d)} </div>
        </div>
    </div>
    `;

export default tooltipMarkup;
