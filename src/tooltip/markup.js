import {
  c,
  getDimensionVal,
  getMetric,
  getMetricVal,
} from '../helper/withCartesian';

const tooltipMarkup = (d, state) =>
  `
    <div class="tooltip-content" style="border-color: ${c(state)(d)};">
        <div class="tooltip-header">${getDimensionVal(state)(d)}</div>
        <div class="tooltip-row">
            <div class="col">${getMetric(state).name} </div>
            <div class="col">${getMetricVal(state)(d)} </div>
        </div>
    </div>
    `;

export default tooltipMarkup;
