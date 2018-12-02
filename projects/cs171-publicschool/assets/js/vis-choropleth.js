var width2 = 640;
var height2 = 480;
var svg2 = d3.select("#map-area").append("svg")
    .attr("width", width2)
    .attr("height", height2);
var path2 = d3.geoPath()
    .projection(choropleth_scale(0.8));

function choropleth_scale(scaleFactor) {
    return d3.geoTransform({
        point: function (x, y) {
            this.stream.point(x * scaleFactor, y * scaleFactor);
        }
    });
}

function updateChoropleth() {
    let selection_MADISTTYPE = d3.select("#school-category").property("value");
    console.log("Viz2: Selected criteria: " + selection_MADISTTYPE);

    svg2.selectAll(".district_polygon_background").remove();
    svg2.selectAll(".district_polygon").remove();

    svg2.selectAll(".district_polygon_background")
        .data(topo_data.filter(function(d){
            return d.properties.MADISTTYPE != selection_MADISTTYPE;
        }))
        .enter().append("path")
        .attr("class", "district_polygon_background")
        .attr("d", path2)
        .style("opacity", 0.3)
        .style("stroke", "lightgrey")
        .style("fill", "lightgrey");

    svg2.selectAll(".district_polygon")
        .data(topo_data.filter(function(d){
            return d.properties.MADISTTYPE == selection_MADISTTYPE;
        }))
        .enter().append("path")
        .attr("class", "district_polygon")
        .attr("d", path2)
        .style("opacity", 0.7)
        .style("stroke", "grey")
        .style("fill", function(d) {
            let grad_rate = +gradrate_by_code_15_16[+d.properties.ORG_CODE];
            if ( grad_rate > 95) {
                return "darkcyan";
            }
            else if ( grad_rate >= 90 && grad_rate <= 95) {
                return "darkorange";
            }
            else {
                return "darkred";
            }
        })
        .on("mouseover", function(d) {
            document.getElementById("td_name").innerHTML = (":  " + d.properties.DISTRICT);

            let result = gradrate_by_code_15_16[+d.properties.ORG_CODE];
            if ((result == undefined) || (result == "")) {
                document.getElementById("td_gradrate").innerHTML = ":  Insufficient data reported";
            }
            else {
                document.getElementById("td_gradrate").innerHTML = ":  " + result + "%";
            }

            result = reading_by_code_15_16[+d.properties.ORG_CODE];
            if ((result == undefined) || (result == "")) {
                document.getElementById("td_SAT_reading").innerHTML = ":  Insufficient data reported";
            }
            else {
                document.getElementById("td_SAT_reading").innerHTML = ":  " + result;
            }

            result = writing_by_code_15_16[+d.properties.ORG_CODE];
            if ((result == undefined) || (result == "")) {
                document.getElementById("td_SAT_writing").innerHTML = ":  Insufficient data reported";
            }
            else {
                document.getElementById("td_SAT_writing").innerHTML = ":  " + result;
            }

            result = math_by_code_15_16[+d.properties.ORG_CODE];
            if ((result == undefined) || (result == "")) {
                document.getElementById("td_SAT_math").innerHTML = ":  Insufficient data reported";
            }
            else {
                document.getElementById("td_SAT_math").innerHTML = ":  " + result;
            }
        });

    svg2.selectAll(".legend-text").remove();
    svg2.selectAll(".legend-rect").remove();

    svg2.append("rect")
        .attr("x", 180)
        .attr("y", 380)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-rect")
        .style("stroke", "grey")
        .style("fill", "darkcyan");
    svg2.append("rect")
        .attr("x", 180)
        .attr("y", 400)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-rect")
        .style("stroke", "grey")
        .style("fill", "darkorange");
    svg2.append("rect")
        .attr("x", 180)
        .attr("y", 420)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-rect")
        .style("stroke", "grey")
        .style("fill", "darkred");
    svg2.append("text")
        .attr("x", 200)
        .attr("y", 380+12)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-text")
        .text("> 95% graduation rate");
    svg2.append("text")
        .attr("x", 200)
        .attr("y", 400+12)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-text")
        .text("90-95% graduation rate");
    svg2.append("text")
        .attr("x", 200)
        .attr("y", 420+12)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "legend-text")
        .text("< 90% graduation rate");
};