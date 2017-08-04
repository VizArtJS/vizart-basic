import Area from '../Area';
import createCartesianOpt from '../../options/createCartesianOpt';

const DefaultOptions = {
    chart: {
        type: 'line',
    },
    plots: {
        curve: 'linear',
        strokeWidth: 3,
        nodeRadius: 4,
        areaOpacity: 1,
        drawArea: false,
        showDots: true
    }
};

class Line extends Area {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);
    }

    createOptions(_userOpt) {
        return createCartesianOpt(DefaultOptions, _userOpt);
    };
}


export default Line;