const centroidOnArc = (arc, context, radius, slice)=> {
    const [x, y] = arc.centroid(slice);
    // pythagorean theorem for hypotenuse
    const h = Math.sqrt(x * x + y * y);

    return [x / h * radius * 0.8,
        y / h * radius * 0.8]
}

export default centroidOnArc;