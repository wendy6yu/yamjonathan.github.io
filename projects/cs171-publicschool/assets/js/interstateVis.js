var magicSalary = 70000;

/*
 *  InterstateVis - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Datafile with school achievement and salary data
 */

InterstateVis = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
}

InterstateVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 40, right: 50, bottom: 40, left: 50 };
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 200 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.15);

    // Axis and Groups
    vis.xAxis = d3.axisBottom();
    vis.xAxisGroup = vis.svg.append("g");

    // Wrangle Data
    vis.wrangleData(magicSalary);
}

// Convert data object into the specific data to be graphed based on slider.
InterstateVis.prototype.wrangleData = function(slider_value){
    var vis = this;

    vis.displayData = vis.data;
    vis.mass_idx = -1;


    vis.displayData.forEach(function (d, i) {
        if (d.STATE == "Massachusetts") {
            d.avg = slider_value;
        }
    });

    // Sort
    vis.displayData = vis.displayData.sort(function(a, b) {
        return b.avg - a.avg;
    });

    //Get Mass and 2 below and above
    vis.mass_idx = vis.displayData.map(function(e) { return e.STATE; }).indexOf("Massachusetts");
    vis.displayData = vis.displayData.filter(function (d, i) {
        return (i >= vis.mass_idx - 2 && i<= vis.mass_idx + 2);
    });


    // Update the visualization
    vis.updateVis();
}

InterstateVis.prototype.updateVis = function () {
    var vis = this;
    console.log("MASS IDX" + vis.mass_idx);


    vis.x.domain(vis.displayData.map(function (d) {
        return d.STATE;
    }));

    vis.rect = vis.svg.selectAll("rect")
        .data(vis.displayData, function (d) { return d.STATE; });

    vis.lab = vis.svg.selectAll("text")
        .data(vis.displayData, function (d) { return d.STATE; });


    vis.xAxis.scale(vis.x);

    // vis.xAxisGroup
    //     .attr("class", "axis x-axis")
    //     .attr("transform", "translate(0, " + vis.height + ")")
    //     .transition()
    //     .call(vis.xAxis);
    //
    // Enter
    vis.rect.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", vis.x.bandwidth())
        // Merge
        .merge(vis.rect)
        .transition()
        .attr("x", function(d) { return vis.x(d.STATE); })
        .attr("y", 15 )
        .attr("height", function(d) { return vis.height - 15; });

    vis.rect.exit().remove();

    vis.lab.enter()
        .append("text")
        .attr("fill", "black")
        .merge(vis.lab)
        .transition()
        .text(function (d, i) { return d.STATE + ", $" + d.avg.toLocaleString() })
        .attr("x", function(d) { return vis.x(d.STATE) + vis.x.bandwidth()/2})
        .attr("y", vis.height/2 + 15)
        .attr("font-size", 14)
        .style("text-anchor", "middle");


    vis.lab.exit().remove();
};
