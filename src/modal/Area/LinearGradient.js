import {Duration, uuid, linearStops } from 'vizart-core';

class LinearGradient {
    constructor(scheme) {
        this._id = uuid();
        this._scheme = scheme;
        this._colorStops = linearStops(scheme);
        this._layer;
    }

    get scheme() {
        return this._scheme;
    }

    set scheme(scheme) {
        this._scheme = scheme;
    }

    id() {
        return '#' + this._id;
    }

    render(_svg) {
        this._layer = _svg.append("linearGradient")
            .attr("id", this._id)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", '0%')
            .attr("y1", '100%')
            .attr("x2", '0%')
            .attr("y2", '0%');

        this._layer
            .selectAll("stop")
            .data(this._colorStops)
            .enter()
            .append("stop")
            .attr("offset", (d) => { return d.offset; })
            .attr("stop-color", (d) => { return d.color; })
            .attr('stop-opacity', 1);
    }

    update(_scheme, _dataLength) {
        this._scheme = _scheme;
        this._colorStops = linearStops(_scheme);

        this._layer
            .selectAll("stop")
            .data(this._colorStops)
            .transition()
            .duration(Duration.CHANGE)
            .delay((d, i)=> { return i / _dataLength * Duration.CHANGE; })
            .attr("offset",  (d)=> { return d.offset;  })
            .attr("stop-color", (d) => { return d.color; });
    }


    top() {
        return this._colorStops[this._colorStops.length - 1].color;
    }
}
export default LinearGradient
