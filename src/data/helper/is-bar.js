const isBar = options => options.chart.type === 'bar'
    || options.chart.type === 'bar_horizontal'
    || options.chart.type === 'bar_grouped'
    || options.chart.type === 'bar_stacked'
    || options.chart.type === 'bar_expanded';

export default isBar;