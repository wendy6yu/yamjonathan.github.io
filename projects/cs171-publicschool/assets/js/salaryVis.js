var magicSalary = 75000;
var magicTickLabels = ["% Graduated", "% Attending College or University", "% Dropped Out", "% Economically Disadvantaged Students Graduating"];

/*
 *  SalaryVis - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Datafile with school achievement and salary data
 */

SalaryVis = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
}

SalaryVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 40, right: 50, bottom: 40, left: 50 };
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.15);
    console.log(vis.width);
    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    // Axis and Groups
    vis.xAxis = d3.axisBottom();
    vis.xAxisGroup = vis.svg.append("g");
    vis.yAxis = d3.axisLeft();
    vis.yAxisGroup = vis.svg.append("g");

    // Wrangle Data
    vis.wrangleData(magicSalary);
}

// Convert data object into the specific data to be graphed based on slider.
SalaryVis.prototype.wrangleData = function(slider_value){
    var vis = this;

    // Gather Slider Data TODO
    vis.slide_data = slider_value;

    //Find nearest school based on salary
    var sal_diff = Number.MAX_SAFE_INTEGER;
    var nearest_idx = -1;
    vis.data.forEach(function (row, idx){
        if(Math.abs(row['Average Salary'] - vis.slide_data) < sal_diff){
            sal_diff = Math.abs(row['Average Salary'] - vis.slide_data);
            nearest_idx = idx;
        }
    });

    vis.selected_school = vis.data[nearest_idx];
    vis.displayData = [
        vis.selected_school["% Graduated"],
        vis.selected_school["Attending Coll./Univ. (%)"],
        vis.selected_school["% Dropped Out"],
        vis.selected_school["% Graduated_disadvantaged"]
    ];

    // Update the visualization
    vis.updateVis();
}

SalaryVis.prototype.updateVis = function () {
    var vis = this;

    //console.log(vis.selected_school);
    $("#school-name").html(
        "You selected <b>$" + vis.slide_data.toLocaleString() +"</b>" +
        "<br>The most similar school or district in Massachusetts was <b>" +
        vis.selected_school["District Name"] + "</b> where the average teacher salary was $" +
        vis.selected_school['Average Salary'].toLocaleString() + "."
    );

    //console.log(vis.displayData);

    vis.x.domain([0, 1, 2, 3]);
    vis.y.domain([0, 100]);

    vis.rect = vis.svg.selectAll("rect")
        .data(vis.displayData);

    vis.yAxis.scale(vis.y);
    vis.yAxisGroup.transition()
        .attr("class", "axis y-axis")
        .call(vis.yAxis);

    vis.xAxis.scale(vis.x)
        .tickFormat(function(d, i) {
            return magicTickLabels[i];
        });
    vis.xAxisGroup
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0, " + vis.height + ")")
        .transition()
        .call(vis.xAxis);

    // Enter
    vis.rect.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", vis.x.bandwidth())
    // Merge
        .merge(vis.rect)
        .transition()
        .attr("x", function(d, i) {
            console.log(vis.x(i)); return vis.x(i); })
        .attr("y", function (d) { return vis.y(d); })
        .attr("height", function(d) { return vis.height - vis.y(d); });

}