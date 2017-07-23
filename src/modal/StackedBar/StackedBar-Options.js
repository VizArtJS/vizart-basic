import { Stacks } from '../../data';
import { DefaultCategoricalColor } from 'vizart-core';

const GroupedOptions = {
    animation: {
        duration: {
            layout: 500
        }
    },
    chart: {
        type: 'bar_grouped'
    },
    color: DefaultCategoricalColor,
    plots: {
        stackLayout: false,
        stackMethod: Stacks.Zero
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
    color: DefaultCategoricalColor,
    plots: {
        stackLayout: true,
        stackMethod: Stacks.Zero
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
    color: DefaultCategoricalColor,
    plots: {
        stackLayout: true,
        stackMethod: Stacks.Expand
    }
};

export {
    GroupedOptions,
    StackedOptions,
    ExpandedOptions
}