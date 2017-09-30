const centroidOnArc = (arc, context, radius, slice)=> {
    const [x, y] = arc.centroid(slice);
    // pythagorean theorem for hypotenuse
    const h = Math.sqrt(x * x + y * y);

    return [x / h * radius,
        y / h * radius]
}

export default centroidOnArc;