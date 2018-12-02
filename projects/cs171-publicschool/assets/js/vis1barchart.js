
var dataObject, data, description;
var yDomain = [];

BarChart = function(_parentElement, _data, _category){
    this.parentElement = _parentElement;
    this.data = _data;
    this.category = _category;

    this.initVis();
}

BarChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 50, right: 0, bottom: 10, left: 125 };
    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.wrangleData();
}

BarChart.prototype.wrangleData = function(){
    var vis = this;

    if (vis.category == "gender") {
        yDomain = ['Female', 'Male'];
        dataObject = {
            female: (vis.data.female_grad / vis.data.female) * 100,
            male: (vis.data.male_grad / vis.data.male) * 100
        };
        description = "Massachusetts has an overall well-balanced population in terms of gender,<br/>with only slightly more " +
            "males than females in its school system. Female students, however, are more likely to graduate than male students.";

        data = [dataObject[Object.keys(dataObject)[0]], dataObject[Object.keys(dataObject)[1]]];
    } else if (vis.category == "ec_status") {
        yDomain = ['Disadvantaged', 'Non-Disadvantaged'];
        dataObject = {
            disadvantaged: (vis.data.disadvantaged_grad / vis.data.disadvantaged) * 100,
            non_disadvantaged: (vis.data.non_disadvantaged_grad / vis.data.non_disadvantaged) * 100
        };
        description = "Massachusetts has a significant portion of economically disadvantaged students. Students that are economically " +
            "disadvantaged are less likely to graduate.";

        data = [dataObject[Object.keys(dataObject)[0]], dataObject[Object.keys(dataObject)[1]]];
    } else {
        yDomain = ['Asian', 'Black', 'Hispanic', 'White', 'Other'];
        dataObject = {
            asian: (vis.data.asian_grad / vis.data.asian) * 100,
            black: (vis.data.black_grad / vis.data.black) * 100,
            hispanic: (vis.data.hispanic_grad / vis.data.hispanic) * 100,
            white: (vis.data.white_grad / vis.data.white) * 100,
            other: (vis.data.other_grad / vis.data.other) * 100
        };
        description = "The students in the Massachusetts public school system are predominantly white, followed by hispanic students," +
            "black students, asian students, and then various other minority groups. Graduation rates vary significantly with ethnicity.";

        data = [dataObject[Object.keys(dataObject)[0]], dataObject[Object.keys(dataObject)[1]], dataObject[Object.keys(dataObject)[2]],
            dataObject[Object.keys(dataObject)[3]], dataObject[Object.keys(dataObject)[4]]];
    }
    //console.log(data);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + 10 +  ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0," + 100 + ")");

    vis.x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, vis.width - 25]);

    vis.y = d3.scaleBand()
        .range([0, vis.height - 100]);

    vis.y.domain(yDomain);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);
    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickSizeOuter(0);

    vis.updateVis();
}


BarChart.prototype.updateVis = function(){
    var vis = this;

    // Update the y-axis
    vis.svg.select(".y-axis").call(vis.yAxis);

    // Update text description
    var text = vis.svg.selectAll(".description")
        .data(description);

    text.enter().append("text")
        .attr("class", "description")
        .merge(text)
        .transition()
        .duration(1000)
        .text(description);

    text.exit().remove();

    // Update barchart
    var categories = vis.svg.selectAll("rect")
        .data(data);

    categories.enter().append("rect")
        .attr("class", "bars")
        .merge(categories)
        .transition()
        .duration(1000)
        .attr("height", 20)
        .attr("width", function(d, i){
            return vis.x(data[i]) - 20;
        })
        .attr("x", 0)
        .attr("y", function(d, i) {
            if (category == "ethnicity") {
                return vis.y.bandwidth() * i * .99 + 118;
            } else {
                return vis.y.bandwidth() * i + 160;
            }
        })
        .attr("fill", "#F47D7D");

    categories.exit().remove();


    // Update labels at end of bars
    var labels = vis.svg.selectAll(".label")
        .data(data);

    labels.enter().append("text")
        .attr("class","label")
        .merge(labels)
        .transition()
        .duration(1000)
        .attr("fill", "#757575")
        .attr("x", function(d, i){
            return vis.x(data[i]) - 15;
        })
        .attr("font-size", "11")
        .attr("y", function(d, i) {
            if (category == "ethnicity") {
                return vis.y.bandwidth() * i * .99 + 128;
            } else {
                return vis.y.bandwidth() * i + 170;
            }
        })
        .text(function(d, i) {
            return Math.round(data[i]) + "%"; });

    labels.exit().remove();
}

BarChart.prototype.selectionChanged = function(category){
    var vis = this;

    vis.category = category;
    vis.wrangleData();
}