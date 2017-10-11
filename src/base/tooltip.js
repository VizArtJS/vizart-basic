const tooltipMarkup = (d, chartContext)=>
    `
    <div class="tooltip-content" style="border-color: ${d.c ? d.c: chartContext._c(d)};">
        <div class="tooltip-header">${chartContext._getDimensionVal(d)}</div>
        <div class="tooltip-row">
            <div class="col">${chartContext._getMetric().name} </div>
            <div class="col">${chartContext._getMetricVal(d)} </div>
        </div>
    </div>
    `;

export default tooltipMarkup;