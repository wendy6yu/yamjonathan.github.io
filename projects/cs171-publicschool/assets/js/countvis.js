CountVis = function(_parentElement, _eventHandler ){
	this.parentElement = _parentElement;
	this.data = [];
	this.displayData = [];
    this.eventHandler = _eventHandler;

	this.initVis();
};


/*
 * Initialize visualization
 */

//var outcome_selection = '% Graduated';
// 'Attending Coll./Univ. (%)'
// '% Dropped Out'

CountVis.prototype.initVis = function(){
	var vis = this;

    vis.data = joined_data;

    vis.margin = { top: 40, right: 40, bottom: 100, left: 60 };
	vis.width = 550 - vis.margin.left - vis.margin.right;
	vis.height = 400 - vis.margin.top - vis.margin.bottom;

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);
    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);
    vis.xAxis = d3.axisBottom()
        .scale(vis.x);
    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .ticks(6);

	// Set domains
    var minY_grad = d3.min(vis.data.map(function(d){ return d['% Graduated']; }));
    var maxY_grad = d3.max(vis.data.map(function(d){ return d['% Graduated']; }));
    var minY_college = d3.min(vis.data.map(function(d){ return d['Attending Coll./Univ. (%)']; }));
    var maxY_college = d3.max(vis.data.map(function(d){ return d['Attending Coll./Univ. (%)']; }));
    var minY_retention = d3.min(vis.data.map(function(d){ return d['% Retained']; }));
    var maxY_retention = d3.max(vis.data.map(function(d){ return d['% Retained']; }));
    var minY = d3.min([minY_grad, minY_college, minY_retention]);
    var maxY = d3.max([maxY_grad, maxY_college, maxY_retention]);

	//var minMaxY= [minY-((maxY-minY)/10), maxY];
    var minMaxY= [minY-((maxY-minY)/10), 100.0];
	vis.y.domain(minMaxY);
	var minMaxX = d3.extent(vis.data.map(function(d){ return d.date; }));
	vis.x.domain(minMaxX);

    vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")");
	vis.svg.append("g")
			.attr("class", "y-axis axis");
	// Axis title
	vis.svg.append("text")
			.attr("x", -50)
			.attr("y", -8)
			.text("Outcomes (%)")
            .attr("class", "chart_caption");

	// Append a path for the line function, so that it is later behind the brush overlay
	vis.gradPath = vis.svg.append("path")
        .attr("class", "line line-grad");
    vis.collegePath = vis.svg.append("path")
        .attr("class", "line line-college");
    vis.retentionPath = vis.svg.append("path")
        .attr("class", "line line-retention");

    // Define the D3 path generator
    vis.valueline_grad = d3.line()
        .x(function(d) {
            return vis.x(d.date);
        })
        .y(function(d) {
            return vis.y(d['% Graduated']);
        });
    vis.valueline_college = d3.line()
        .x(function(d) {
            return vis.x(d.date);
        })
        .y(function(d) {
            return vis.y(d['Attending Coll./Univ. (%)']);
        });
    vis.valueline_retention = d3.line()
        .x(function(d) {
            return vis.x(d.date);
        })
        .y(function(d) {
            return vis.y(d['% Retained']);
        });

	// Initialize brushing component
	vis.currentBrushRegion = null;
	vis.brush = d3.brushX()
        .extent([[0,0],[vis.width,vis.height]])
        .on("brush", function(){
            vis.currentBrushRegion = d3.event.selection;
            vis.currentBrushRegion = vis.currentBrushRegion.map(vis.x.invert);
            $(vis.eventHandler).trigger("selectionChanged", vis.currentBrushRegion);
        });

    // Append brush component here
	vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush");

    vis.brushGroup.call(vis.brush);

	// (Filter, aggregate, modify data)
	vis.wrangleData();
};



/*
 * Data wrangling
 */
CountVis.prototype.wrangleData = function(){
	var vis = this;
	vis.displayData = vis.data;
	vis.updateVis();
};


CountVis.prototype.updateVis = function(){
	var vis = this;

    vis.brushGroup.call(vis.brush);

	vis.gradPath
        .data([vis.displayData])
        .attr("d", vis.valueline_grad);
    vis.collegePath
        .data([vis.displayData])
        .attr("d", vis.valueline_college);
    vis.retentionPath
        .data([vis.displayData])
        .attr("d", vis.valueline_retention);

    vis.svg.selectAll(".dot_grad")
        .data(vis.displayData)
        .enter().append("circle")
        .attr("class", "dot_grad")
        .attr("cx", function(d) { return vis.x(d.date)})
        .attr("cy", function(d) { return vis.y(d['% Graduated']) })
        .attr("r", 4);
    vis.svg.selectAll(".dot_college")
        .data(vis.displayData)
        .enter().append("circle")
        .attr("class", "dot_college")
        .attr("cx", function(d) { return vis.x(d.date)})
        .attr("cy", function(d) { return vis.y(d['Attending Coll./Univ. (%)']) })
        .attr("r", 4);
    vis.svg.selectAll(".dot_retention")
        .data(vis.displayData)
        .enter().append("circle")
        .attr("class", "dot_retention")
        .attr("cx", function(d) { return vis.x(d.date)})
        .attr("cy", function(d) { return vis.y(d['% Retained']) })
        .attr("r", 4);

    vis.svg.append("rect")
        .attr("x", 10)
        .attr("y", 300)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-rect")
        .style("fill", "steelblue");
    vis.svg.append("text")
        .attr("x", 30)
        .attr("y", 300+12)
        .attr("class", "legend-text")
        .text("Grad Rate");
    vis.svg.append("rect")
        .attr("x", 110)
        .attr("y", 300)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-rect")
        .style("fill", "goldenrod");
    vis.svg.append("text")
        .attr("x", 130)
        .attr("y", 300+12)
        .attr("class", "legend-text")
        .text("Retention Rate");
    vis.svg.append("rect")
        .attr("x", 240)
        .attr("y", 300)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-rect")
        .style("fill", "forestgreen");
    vis.svg.append("text")
        .attr("x", 260)
        .attr("y", 300+12)
        .attr("class", "legend-text")
        .text("College/Univ. Matriculation");


	// Call axis functions with the new domain 
	vis.svg.select(".x-axis").call(vis.xAxis);
	vis.svg.select(".y-axis").call(vis.yAxis);
};