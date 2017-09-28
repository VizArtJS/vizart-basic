import { Stacks } from '../../data';

const GroupedOptions = {
    animation: {
        duration: {
            layout: 500
        }
    },
    chart: {
        type: 'bar_grouped'
    },
    plots: {
        stackLayout: false,
        stackMethod: Stacks.Zero,
        barLabel: {
            enabled: true,
            color: 'black'
        },
        metricLabel: {
            enabled: true,
            color: 'black',
            offset: 10
        }
    }
};

const StackedOptions = {
    animation: {
        duration: {
            layout: 500
        }
    },
    chart: {
        type: 'bar_grouped'
    },
    plots: {
        stackLayout: true,
        stackMethod: Stacks.Zero,
        barLabel: {
            enabled: true,
            color: 'black'
        },
        metricLabel: {
            enabled: true,
            color: 'black',
            offset: 10
        }
    }
};

const ExpandedOptions = {
    animation: {
        duration: {
            layout: 500
        }
    },
    chart: {
        type: 'bar_grouped'
    },
    plots: {
        stackLayout: true,
        stackMethod: Stacks.Expand,
        barLabel: {
            enabled: true,
            color: 'black'
        },
        metricLabel: {
            enabled: true,
            color: 'black',
            offset: 10
        }
    }
};

export {
    GroupedOptions,
    StackedOptions,
    ExpandedOptions
}