import { Stacks } from '../../data';

const StackedOptions = {
    chart: {
        type: 'area_stacked',
    },
    animation: {
        duration: {
            curve: 500
        }
    },
    plots: {
        stackLayout: true,
        stackMethod: Stacks.Zero,
        showDots: false,
        curve: 'cardinal',
        strokeWidth: 2,
        opacityArea: 0.7
    }
};

const AreaMultiOptions = {
    chart: {
        type: 'area_multi',
    },
    animation: {
        duration: {
            curve: 500
        }
    },
    plots: {
        stackLayout: false,
        stackMethod: Stacks.Zero,
        showDots: false,
        curve: 'cardinal',
        strokeWidth: 2,
        opacityArea: 0.7
    }
};


const ExpandedOptions = {
    chart: {
        type: 'area_expanded',
    },
    animation: {
        duration: {
            curve: 500
        }
    },
    plots: {
        stackLayout: true,
        stackMethod: Stacks.Expand,
        showDots: false,
        curve: 'cardinal',
        strokeWidth: 2,
        opacityArea: 0.7
    }
};

export {
    StackedOptions,
    AreaMultiOptions,
    ExpandedOptions
}