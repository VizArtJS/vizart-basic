import { scaleLinear } from 'd3-scale';

const getInitialState = (dimensions, nestedData, opt, c)=> {
    const sliceNum = dimensions.length;
    const angleScale = scaleLinear()
        .domain([0, sliceNum])
        .range([0, 2 * Math.PI]);

    return dimensions.map((d, i) => {
        let array = nestedData.map(e=> {
            return {
                key: e.key,
                s: e.key,
                c: c(e.key),
                alpha: opt.plots.opacity,
                startAngle: angleScale(i),
                endAngle: angleScale(i + 1),
                r: 0,
                data: e.values[i],
            }
        });
        // larger slice are drawn first
        array.sort((a, b) => b.data.y - a.data.y);

        return {
            dimension: d,
            slice: array
        }
    });
}

export default getInitialState;