var width = 500,
    height = 700;

var svg = d3.select("#rectangles").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("defs")
    .append("g")
    .attr("id","iconCustom")
    .append("path")
    .attr("d","M14.6,4.9c0,2.5-2,4.4-4.4,4.4s-4.4-2-4.4-4.4s2-4.4,4.4-4.4S14.6,2.5,14.6,4.9z M15,27.4h1.5\n" +
        "\tc1.6,0,2.9-1.2,2.9-2.6V11.6c0-1.4-1.3-2.6-2.9-2.6h-13c-1.6,0-2.9,1.2-2.9,2.6v13.2c0,1.4,1.3,2.6,2.9,2.6h1.9l0,0v13.4\n" +
        "\tc0,1.4,1.3,2.6,2.9,2.6h3.9c1.6,0,2.9-1.2,2.9-2.6V27.4");

//specify the number of columns and rows for grid
var numCols = 10;
var numRows = 10;

//padding and spacing for grid
var xPadding = 75;
var yPadding = 25;
var hBuffer = 55;
var wBuffer = 40;

var myIndex=d3.range(numCols*numRows);

var category = "gender";
d3.select("#select-box2").on("change", function(){
    category = d3.select("#select-box2").property("value");
    updateGrid();
    barChart.selectionChanged(category);
});


var simplifiedData = [];
var allData, barChart;
var students = 0, female = 0, asian = 0, black = 0, hispanic = 0, white = 0, disadvantaged = 0,
    students_grad = 0, female_grad = 0, asian_grad = 0, black_grad = 0, hispanic_grad = 0, white_grad = 0, disadvantaged_grad = 0;

d3.csv("data/school_dataset.csv", function(data){

    //console.log(data);
    simplifiedData = data.map(function(d){

        var result = {
            students: +d['# in Cohort'].replace(/,/g, ''),
            female: +d['# in Cohort_female'].replace(/,/g, ''),
            disadvantaged: +d['# in Cohort_disadvantaged'].replace(/,/g, ''),
            asian: +d['# in Cohort_asian'].replace(/,/g, ''),
            black: +d['# in Cohort_black'].replace(/,/g, ''),
            hispanic: +d['# in Cohort_hispanic'].replace(/,/g, ''),
            white: +d['# in Cohort_white'].replace(/,/g, ''),
            students_grad: +d['# in Cohort'].replace(/,/g, '') * (+d['% Graduated']/100),
            female_grad: +d['# in Cohort_female'].replace(/,/g, '') * (+d['% Graduated_female']/100),
            disadvantaged_grad: +d['# in Cohort_disadvantaged'].replace(/,/g, '') * +d['% Graduated_disadvantaged']/100,
            asian_grad: +d['# in Cohort_asian'].replace(/,/g, '') * (+d['% Graduated_asian']/100),
            black_grad: +d['# in Cohort_black'].replace(/,/g, '') * (+d['% Graduated_black']/100),
            hispanic_grad: +d['# in Cohort_hispanic'].replace(/,/g, '') * (+d['% Graduated_hispanic']/100),
            white_grad: +d['# in Cohort_white'].replace(/,/g, '') * (+d['% Graduated_white']/100)
        };

        return result;
    });
    //console.log(simplifiedData);

    simplifiedData.forEach(function(d){
        students += d.students;
        female += d.female;
        asian += d.asian;
        black += d.black;
        hispanic += d.hispanic;
        white += d.white;
        disadvantaged += d.disadvantaged;
        students_grad += d.students_grad;
        female_grad += d.female_grad;
        disadvantaged_grad += d.disadvantaged_grad;
        asian_grad += d.asian_grad;
        black_grad += d.black_grad;
        hispanic_grad += d.hispanic_grad;
        white_grad += d.white_grad;
    });

    allData = {
        students: students,
        female: female,
        get male() {
            return this.students - this.female;
        },
        asian: asian,
        black: black,
        hispanic: hispanic,
        white: white,
        get other() {
            return this.students - (this.asian + this.black + this.hispanic + this.white);
        },
        disadvantaged: disadvantaged,
        get non_disadvantaged() {
            return this.students - this.disadvantaged;
        },
        students_grad: students_grad,
        female_grad: female_grad,
        get male_grad() {
            return this.students_grad - this.female_grad;
        },
        disadvantaged_grad: disadvantaged_grad,
        get non_disadvantaged_grad() {
            return this.students_grad - this.disadvantaged_grad;
        },
        asian_grad: asian_grad,
        black_grad: black_grad,
        hispanic_grad: hispanic_grad,
        white_grad: white_grad,
        get other_grad() {
            return this.students_grad - (this.asian_grad + this.hispanic_grad + this.black_grad + this.white_grad);
        }
    };
    console.log(allData);

    updateGrid();
    barChart = new BarChart('bar-graph', allData, category);

});

function updateGrid(){
    var female_percent, asian_percent, black_percent, hispanic_percent,
        white_percent, disadvantaged_percent;

    //select color division for people icons
    if (category == "ethnicity"){
        asian_percent = Math.round(allData.asian / allData.students * 100);
        black_percent = Math.round(allData.black / allData.students * 100) + asian_percent;
        hispanic_percent = Math.round(allData.hispanic / allData.students * 100) + black_percent;
        white_percent = Math.round(allData.white / allData.students * 100) + hispanic_percent;

    } else if (category == "ec_status"){
        disadvantaged_percent = Math.round(allData.disadvantaged / allData.students * 100);

    } else {
        female_percent = Math.round(allData.female / allData.students * 100);
    }

    //create group element and create an svg <use> element for each icon
    var group = svg.selectAll("use")
        .data(myIndex);

    group.enter().append("use")
        .merge(group)
        .attr("id","pictoLayer")
        .attr("xlink:href","#iconCustom")
        .transition(2000)
        .attr("id",function(d)    {
            return "icon"+d;
        })
        .attr("x",function(d) {
            var remainder=d % numCols;
            return xPadding+(remainder*wBuffer);
        })
        .attr("y",function(d) {
            var whole=Math.floor(d/numCols);
            return yPadding+(whole*hBuffer);
        })
        .attr("fill", function(d, i){
            if (category == "ethnicity"){
                if (i < asian_percent){
                    return "#CFDE88";
                } else if (i >= asian_percent && i < black_percent) {
                    return "#EE9E62";
                } else if (i >= black_percent && i < hispanic_percent) {
                    return "#939EE9";
                } else if (i >= hispanic_percent && i < white_percent) {
                    return "#F08A7E";
                } else {
                    return "#B2BDB3";
                }
            } else if (category == "ec_status"){
                if (i < disadvantaged_percent){
                    return "#7D9CF4";
                }
                return "#F4A17D";
            } else {
                if (i < female_percent){
                    return "#F47D7D";
                }
                return "#84BAE7";
            }
        });

    group.exit().remove();
}