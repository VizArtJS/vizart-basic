const rotateXTicks = (_selector, angle, transition = false)=> {
    let _rotate = "rotate(-" + angle + ")";

    let _tickText = _selector.selectAll('.x.axis .tick text');

    if (transition === true) {
        _tickText.transition().duration(300);
    }

    if (angle === 90) {
        _tickText
            .attr("transform", _rotate)
            .attr("dx", -10)
            .attr("dy", -6)
            .style("text-anchor", "end");
    } else if (angle === 0) {
        _tickText
            .attr("transform", _rotate)
            .attr("dx", 0)
            .attr("dy", 10)
            .style("text-anchor", "middle");
    } else if (angle === 60 || angle === 45) {
        _tickText
            .attr("transform", _rotate)
            .attr("dx", -10)
            .attr("dy", 0)
            .style("text-anchor", "end");
    } else if (angle === 75) {
        _tickText
            .attr("transform", _rotate)
            .attr("dx", -10)
            .attr("dy", -4)
            .style("text-anchor", "end");
    } else if (angle === 30) {
        _tickText
            .attr("transform", _rotate)
            .attr("dx", -5)
            .attr("dy", 7)
            .style("text-anchor", "end");
    }
};


export default rotateXTicks
