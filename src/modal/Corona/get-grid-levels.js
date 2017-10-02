import isNumber from 'lodash-es/isNumber';
import isFinite from 'lodash-es/isFinite';

const getGridLevels = opt=> {
    let levels = opt.data.y[0].ticksTier + 1;

    if (isNumber(opt.plots.levels)
        && isFinite(opt.plots.levels)
        && parseInt(opt.plots.levels) > 0) {
        levels = parseInt(opt.plots.levels);
    }

    return levels;
}

export default getGridLevels;