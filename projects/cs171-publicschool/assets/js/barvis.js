
BarVis = function(_parentElement){
    this.parentElement = _parentElement;
    this.data = [];
    this.filteredData = this.data;
    this.filteredIndexes = [];
    this.startYear;
    this.endYear;

    this.initVis();
};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

BarVis.prototype.initVis = function(){
    var vis = this;

    vis.data = joined_data;

    // Default to all years
    vis.filteredData = joined_data;
    vis.startYear = 2011;
    vis.endYear = 2016;
    vis.filteredIndexes = [0,1,2,3,4,5];

    vis.margin = { top: 30, right: 0, bottom: 80, left: 60 };
    vis.width = 500 - vis.margin.left - vis.margin.right;
    vis.height = 440 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales and axes
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.2)
        .domain(d3.range(0,7));
            // 6 categories for now: asian, black, hispanic, white, male, female, disadvantaged
            // adapt to accomodate category subset based on user selection

    vis.y = d3.scaleLinear()
        .range([vis.height,0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Legend
    vis.svg.append("rect")
        .attr("x", 40)
        .attr("y", 395)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-rect")
        .style("fill", "steelblue");
    vis.svg.append("text")
        .attr("x", 60)
        .attr("y", 395+12)
        .attr("class", "legend-text")
        .text("Grad Rate");
    vis.svg.append("rect")
        .attr("x", 160)
        .attr("y", 395)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-rect")
        .style("fill", "forestgreen");
    vis.svg.append("text")
        .attr("x", 180)
        .attr("y", 395+12)
        .attr("class", "legend-text")
        .text("College/Univ. Matriculation");

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/*
 * Data wrangling
 */
BarVis.prototype.wrangleData = function(){
	var vis = this;

	vis.number_of_categories = 7;
	vis.categories = ['asian', 'black', 'hispanic', 'white', 'male', 'female', 'low income'];

    vis.displayData_grad = [];
    let sum_asian = 0;
    let sum_black = 0;
    let sum_hispanic = 0;
    let sum_white = 0;
    let sum_male = 0;
    let sum_female = 0;
    let sum_disadvantaged = 0;
    vis.filteredIndexes.forEach(function(d) {
        sum_asian += vis.filteredData[d]['% Graduated_asian'];
        sum_black += vis.filteredData[d]['% Graduated_black'];
        sum_hispanic += vis.filteredData[d]['% Graduated_hispanic'];
        sum_white += vis.filteredData[d]['% Graduated_white'];
        sum_male += vis.filteredData[d]['% Graduated_male'];
        sum_female += vis.filteredData[d]['% Graduated_female'];
        sum_disadvantaged += vis.filteredData[d]['% Graduated_disadvantaged'];
    });
    vis.displayData_grad.push(sum_asian/vis.filteredIndexes.length);
    vis.displayData_grad.push(sum_black/vis.filteredIndexes.length);
    vis.displayData_grad.push(sum_hispanic/vis.filteredIndexes.length);
    vis.displayData_grad.push(sum_white/vis.filteredIndexes.length);
    vis.displayData_grad.push(sum_male/vis.filteredIndexes.length);
    vis.displayData_grad.push(sum_female/vis.filteredIndexes.length);
    vis.displayData_grad.push(sum_disadvantaged/vis.filteredIndexes.length);

    vis.displayData_college = [];
    sum_asian = 0;
    sum_black = 0;
    sum_hispanic = 0;
    sum_white = 0;
    sum_male = 0;
    sum_female = 0;
    sum_disadvantaged = 0;
    vis.filteredIndexes.forEach(function(d) {
        sum_asian += vis.filteredData[d]['Attending Coll./Univ. (%)_asian'];
        sum_black += vis.filteredData[d]['Attending Coll./Univ. (%)_black'];
        sum_hispanic += vis.filteredData[d]['Attending Coll./Univ. (%)_hispanic'];
        sum_white += vis.filteredData[d]['Attending Coll./Univ. (%)_white'];
        sum_male += vis.filteredData[d]['Attending Coll./Univ. (%)_male'];
        sum_female += vis.filteredData[d]['Attending Coll./Univ. (%)_female'];
        sum_disadvantaged += vis.filteredData[d]['Attending Coll./Univ. (%)_disadvantaged'];
    });
    vis.displayData_college.push(sum_asian/vis.filteredIndexes.length);
    vis.displayData_college.push(sum_black/vis.filteredIndexes.length);
    vis.displayData_college.push(sum_hispanic/vis.filteredIndexes.length);
    vis.displayData_college.push(sum_white/vis.filteredIndexes.length);
    vis.displayData_college.push(sum_male/vis.filteredIndexes.length);
    vis.displayData_college.push(sum_female/vis.filteredIndexes.length);
    vis.displayData_college.push(sum_disadvantaged/vis.filteredIndexes.length);


    // Update the visualization
	vis.updateVis();
};


/*
 * The drawing function
 */
BarVis.prototype.updateVis = function(){
	var vis = this;

    // Update domains
    vis.y.domain([d3.min(vis.displayData_college)-2, d3.max(vis.displayData_grad)+2]);
    //vis.y.domain([d3.min(vis.displayData)-2, 100]);

    // Graduation Rate Bars
    var bars_grad = vis.svg.selectAll(".bar4_grad")
        .data(vis.displayData_grad);
    bars_grad.enter().append("rect")
        .attr("class", "bar4_grad")
        .merge(bars_grad)
        .transition()
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d){
            return vis.height - vis.y(d);
        })
        .attr("x", function(d, index){
            return vis.x(index);
        })
        .attr("y", function(d){
            return vis.y(d);
        });
    bars_grad.exit().remove();

    // Graduation Rate Bars
    var bars_college = vis.svg.selectAll(".bar4_college")
        .data(vis.displayData_college);
    bars_college.enter().append("rect")
        .attr("class", "bar4_college")
        .merge(bars_college)
        .transition()
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d){
            return vis.height - vis.y(d);
        })
        .attr("x", function(d, index){
            return vis.x(index);
        })
        .attr("y", function(d){
            return vis.y(d);
        });
    bars_college.exit().remove();


    // Grad Rate Labels
    var labels_grad = vis.svg.selectAll(".labels4_grad")
        .data(vis.displayData_grad);
    labels_grad.enter().append("text")
        .attr("class", "labels4_grad")
        .merge(labels_grad)
        .transition()
        .attr("x", function(d, index){
            return vis.x(index)+3;
        })
        .attr("y", function(d){
            return vis.y(d)+11;
        })
        .text(function(d){
            return Math.round(d) + "%";
        });
    labels_grad.exit().remove();

    // College Labels
    var labels_college = vis.svg.selectAll(".labels4_college")
        .data(vis.displayData_college);
    labels_college.enter().append("text")
        .attr("class", "labels4_college")
        .merge(labels_college)
        .transition()
        .attr("x", function(d, index){
            return vis.x(index)+24;
        })
        .attr("y", function(d){
            return vis.y(d)+11;
        })
        .text(function(d){
            return Math.round(d) + "%";
        });
    labels_college.exit().remove();


    // Call axis function with the new domain
    vis.svg.select(".y-axis").call(vis.yAxis);
    vis.svg.select(".x-axis").call(vis.xAxis)
        .selectAll("text")
        .style("font-size", 13)
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .text(function(i){
            return vis.categories[i];
        });
    // Axis title
    vis.svg.selectAll(".barvis-title").remove();
    vis.svg.append("text")
        .attr("class", "barvis-title")
        .attr("x", -50)
        .attr("y", -8)
        .text("Averaged Outcomes by Demographic(%), from " + vis.startYear + " through " + vis.endYear + ":");

};


BarVis.prototype.onSelectionChange = function(selectionStart, selectionEnd){
	var vis = this;
	vis.startYear = selectionStart;
	vis.endYear = selectionEnd;

	// Filter original unfiltered data depending on selected time period (brush)
    vis.filteredData = vis.data.filter(function(d){
        return (d.date.getFullYear() >= selectionStart && d.date.getFullYear() <= selectionEnd);
    });

    let filteredYears_size = (selectionEnd-selectionStart)+1;
    vis.filteredIndexes = range(filteredYears_size, 0);

    vis.wrangleData();
};

function range(size, startAt) {
    return [...Array(size).keys()].map(i => i + startAt);
}