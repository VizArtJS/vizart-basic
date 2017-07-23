import { Mixin } from 'mixwith';

import { voronoi } from 'd3-voronoi';

import map from 'lodash-es/map';
import flatten from 'lodash-es/flatten';


let VoronoiStackedMixin = Mixin((superclass) => class extends superclass {
    constructor(canvasId, _userOptions) {
        super(canvasId, _userOptions);

        this._voronoi = voronoi()
            .x(this._x)
            .y(this._y)
            .extent([[0, 0], [this._options.chart.innerWidth, this._options.chart.innerHeight]]);
        this._voronoiGroup;
    }

    render(_data) {
        super.render(_data);
    }

    bind(_selector) {
        this.selector = _selector;
    }

    update() {
        super.update();

        if(this._options.plots.stackLayout === true) {
            this._voronoi.y(this._y1);
        } else {
            this._voronoi.y(this._y);
        }


        // voronoi ----
        this._svg.select('.voronoi-group').remove();

        this._svg.selectAll('.curve')
            .attr('data-ctrl', (d)=> { return 'path-ctrl-' + d.key});

        this._svg.selectAll('.node')
            .attr("data-ctrl", (d)=> { return "stream-node-"
                + this._getSeriesVal(d)
                + '-'
                + this._getDimensionVal(d); });

        this._voronoiGroup = this._svg.append("g")
            .attr("class", "voronoi-group");

        let voronoiLayer = flatten(map(this._data.nestedData, 'values'));

        let diagram = this._voronoi(voronoiLayer);

        this._voronoiGroup.selectAll(".web")
            .data(diagram)
            .enter()
            .append("path")
            .attr("d", (d)=> { return d ? "M" + d.join("L") + "Z" : ''; })
            .datum((d)=> {  return d ? d.point : null; })
            .attr("class", 'web')
            .style("stroke", "#2074A0")
            .style("fill", "none")
            .style('stroke', '#7EB852')
            .style('stroke-opacity', 0)
            .style("pointer-events", "all")
            .on("mouseover", this.mouseOn)
            .on("mouseout",  this.mouseOff);
    }

    mouseOn(d, i) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        var color = _color(d);

        var coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];

        var html = Tooltip.stacked(
            _getSeries().name,
            _getDimension().name,
            _getMetric().name,
            _getSeriesVal(d),
            _getDimensionVal(d),
            _getMetricValue(d),
            color
        );

        tooltip.style("left", (x + 22) + "px")
            .style("top", (y + 84) + "px")
            .html(html);

        var nodeGrid = svg.select("[data-ctrl=\"stream-node-"+ _getSeriesVal(d) + "-" + _getDimensionVal(d) + "\"]");
        var pathGrid = svg.select("[data-ctrl=\"path-ctrl-"+ _getSeriesVal(d) + "\"]");

        svg.selectAll(".stacked-area-path")
            .transition().duration(200)
            .style("stroke-opacity", 0.1)
            .style('fill-opacity', 0.1);

        svg.selectAll('.area-node')
            .transition().duration(200)
            .style("opacity", 0.1);

        nodeGrid
            .transition().duration(200)
            .style('opacity', 1);

        pathGrid
            .transition().duration(200)
            .style('stroke-opacity', 1)
            .style("fill-opacity", options.plots.opacityArea);
    }
    mouseOff(d, i) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);

        svg.selectAll(".stacked-area-path")
            .transition().duration(200)
            .style("stroke-opacity", 1)
            .style('fill-opacity', options.plots.opacityArea);

        svg.selectAll('.area-node')
            .transition().duration(200)
            .style("opacity", 1);
    }

});

export default VoronoiStackedMixin;