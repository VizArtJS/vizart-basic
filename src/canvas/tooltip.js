const TooltipMarkup = d=>
    `
    <div class="tooltip-content" style="${d.style};">
        <div class="tooltip-header">${d.x}</div>
        <div class="tooltip-row">
            <div class="col">${d.metric} </div>
            <div class="col">${d.y} </div>
        </div>
    </div>
    `;

export default TooltipMarkup;