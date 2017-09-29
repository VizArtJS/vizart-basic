import {
    arc,
    radialArea,
    radialLine,
    curveLinearClosed,
    curveCardinalClosed
} from 'd3-shape';

const innerRadar = (innerRadius, angleSlice)=> {
    return radialArea()
        .curve(curveCardinalClosed)
        .angle((d,i)=> i * angleSlice)
        .innerRadius(innerRadius)
        .outerRadius(innerRadius);
}

const outerRadar = (innerRadius, outerRadius, angleSlice)=> {
    return radialArea()
        .curve(curveCardinalClosed)
        .angle((d,i)=> i * angleSlice)
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
}

const innerLine = (innerRadius, angleSlice)=> {
    return radialLine()
        .curve(curveCardinalClosed)
        .angle((d,i)=> i * angleSlice)
        .radius(innerRadius);
}

const outerLine = (innerRadius, outerRadius, angleSlice)=> {
    return radialLine()
        .curve(curveCardinalClosed)
        .angle((d,i)=> i * angleSlice)
        .radius(outerRadius);
}


export {
    innerRadar,
    outerRadar,
    innerLine,
    outerLine
}