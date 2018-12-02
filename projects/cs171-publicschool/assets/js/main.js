var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");

var topo_data = [];
var school_data_10_11 = [];
var school_data_11_12 = [];
var school_data_12_13 = [];
var school_data_13_14 = [];
var school_data_14_15 = [];
var school_data_15_16 = [];

var school_data_10_11_aggregate = [];
var school_data_11_12_aggregate = [];
var school_data_12_13_aggregate = [];
var school_data_13_14_aggregate = [];
var school_data_14_15_aggregate = [];
var school_data_15_16_aggregate = [];

var state_salaries_15_16 = [];

var viz3_alldata = [];

var joined_data = [];

//Dictionary: Outcome by district identifier
var gradrate_by_code_15_16 = {};
var reading_by_code_15_16 = {};
var writing_by_code_15_16 = {};
var math_by_code_15_16 = {};


var salaryVis, interstateVis;

queue()
    .defer(d3.csv, "data/10_11_school_dataset_v4.csv")
    .defer(d3.csv, "data/11_12_school_dataset_v4.csv")
    .defer(d3.csv, "data/12_13_school_dataset_v4.csv")
    .defer(d3.csv, "data/13_14_school_dataset_v4.csv")
    .defer(d3.csv, "data/14_15_school_dataset_v4.csv")
    .defer(d3.csv, "data/15_16_school_dataset_v4.csv")
    .defer(d3.csv, "data/15_16_state_salaries.csv")
    .defer(d3.json, "data/schools.topo.json")
    .await(function(error, _school_data_10_11, _school_data_11_12, _school_data_12_13, _school_data_13_14, _school_data_14_15, _school_data_15_16, _state_salaries_15_16, _topojson_data){
        if (error) {
            throw error;
        }
        school_data_10_11 = _school_data_10_11;
        school_data_11_12 = _school_data_11_12;
        school_data_12_13 = _school_data_12_13;
        school_data_13_14 = _school_data_13_14;
        school_data_14_15 = _school_data_14_15;
        school_data_15_16 = _school_data_15_16;

        state_salaries_15_16 = _state_salaries_15_16;

        topo_data = topojson.feature(_topojson_data, _topojson_data.objects.SCHOOLDISTRICTS_POLY).features;

        school_data_10_11_aggregate = school_data_10_11.filter(function(d){
                return d['District Code'] == '0';
            })[0];
            school_data_11_12_aggregate = school_data_11_12.filter(function(d){
                return d['District Code'] == '0';
            })[0];
            school_data_12_13_aggregate = school_data_12_13.filter(function(d){
                return d['District Code'] == '0';
            })[0];
            school_data_13_14_aggregate = school_data_13_14.filter(function(d){
                return d['District Code'] == '0';
            })[0];
            school_data_14_15_aggregate = school_data_14_15.filter(function(d){
                return d['District Code'] == '0';
            })[0];
            school_data_15_16_aggregate = school_data_15_16.filter(function(d){
                return d['District Code'] == '0';
            })[0];

            joined_data.push(school_data_10_11_aggregate);
            joined_data.push(school_data_11_12_aggregate);
            joined_data.push(school_data_12_13_aggregate);
            joined_data.push(school_data_13_14_aggregate);
            joined_data.push(school_data_14_15_aggregate);
            joined_data.push(school_data_15_16_aggregate);

            joined_data.forEach(function(d) {
                d.date = dateParser(d.date);
                d['% Graduated'] = +d['% Graduated'];
                d['Attending Coll./Univ. (%)'] = +d['Attending Coll./Univ. (%)'];
                d['% Retained'] = 100.0 - (+d['% Dropped Out']);

                d['Attending Coll./Univ. (%)_asian'] = +d['Attending Coll./Univ. (%)_asian'];
                d['Attending Coll./Univ. (%)_black'] = +d['Attending Coll./Univ. (%)_black'];
                d['Attending Coll./Univ. (%)_hispanic'] = +d['Attending Coll./Univ. (%)_hispanic'];
                d['Attending Coll./Univ. (%)_white'] = +d['Attending Coll./Univ. (%)_white'];
                d['Attending Coll./Univ. (%)_male'] = +d['Attending Coll./Univ. (%)_male'];
                d['Attending Coll./Univ. (%)_female'] = +d['Attending Coll./Univ. (%)_female'];
                d['Attending Coll./Univ. (%)_disadvantaged'] = +d['Attending Coll./Univ. (%)_disadvantaged'];

                d['% Graduated_asian'] = +d['% Graduated_asian'];
                d['% Graduated_black'] = +d['% Graduated_black'];
                d['% Graduated_hispanic'] = +d['% Graduated_hispanic'];
                d['% Graduated_white'] = +d['% Graduated_white'];
                d['% Graduated_male'] = +d['% Graduated_male'];
                d['% Graduated_female'] = +d['% Graduated_female'];
                d['% Graduated_disadvantaged'] = +d['% Graduated_disadvantaged'];
            });

            console.log(school_data_15_16);

            //Populate dictionary, map outcomes indexed by district identifier
            school_data_15_16.forEach(function(d) {
                gradrate_by_code_15_16[d['District Code']] = d['% Graduated'];
                reading_by_code_15_16[d['District Code']] = Math.round(d['Reading']);
                writing_by_code_15_16[d['District Code']] = Math.round(d['Writing']);
                math_by_code_15_16[d['District Code']] = Math.round(d['Math']);
            });

            createVis4();
            createVis3();
            updateChoropleth();
        }
    );


//Viz 3 - Zach
function createVis3(){
    // Parse Teacher Data
    school_data_15_16.forEach(function(row){
        // https://nelsonslog.wordpress.com/2014/04/24/d3-js-using-csv-for-numbers/
        row["Average Salary"] = row["Average Salary"].trim().substring(1);
        row["Salary Totals"] = row["Salary Totals"].trim().substring(1);
        let r = {};
        for (let k in row) {
            //console.log(row);
            row["Average Salary"] = row["Average Salary"].replace(/,/g, "");
            r[k] = +row[k];
            if (isNaN(r[k])) {
                r[k] = row[k];
            }
        }
        viz3_alldata.push(r);
    });

    // Parse interstate Data
    //console.log(state_salaries_15_16);
    state_salaries_15_16.forEach(function (row) {
        row.avg = +(row["AVERAGE SALARY"].trim().substring(1).replace(/,/g, ""));
    });
    interstateVis = new InterstateVis("interstate-vis", state_salaries_15_16);
    salaryVis = new SalaryVis("salary-vis", viz3_alldata);

    // Initialize Slider
    var slider = document.getElementById('slider');
    noUiSlider.create(slider, {
        range: {
            min: 50,
            max: 75
        },
        start: [60],
        pips: {mode: 'count', values: 3}
    });
    slider.noUiSlider.on('update', function (values) {
        salaryVis.wrangleData((+values)*1000);
        interstateVis.wrangleData((+values)*1000);
    });
}


// Viz 4 - Yam
function createVis4(){
    // Create event handler
    var MyEventHandler = {};

    // Create visualization instances
    var countVis = new CountVis("countvis", MyEventHandler);
    var barVis = new BarVis("barvis");

    // Bind event handler
    $(MyEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd){
        //console.log('Brushed! ' + rangeStart.getFullYear() + ' to ' + rangeEnd.getFullYear());

        barVis.onSelectionChange(rangeStart.getFullYear(), rangeEnd.getFullYear());
        document.getElementById('range').innerHTML = " Showing data from <b>" + rangeStart.getFullYear() + "</b> through <b>" + rangeEnd.getFullYear() + "</b>";
    })

}


/*
	Escape Velocity by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/
(function($) {
	var	$window = $(window),
		$body = $('body');
	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ null,      '736px'  ]
		});
	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});
	// Dropdowns.
		$('#nav > ul').dropotron({
			mode: 'fade',
			noOpenerFade: true,
			alignment: 'center',
			detach: false
		});
	// Nav.
		// Title Bar.
			$(
				'<div id="titleBar">' +
					'<a href="#navPanel" class="toggle"></a>' +
					'<span class="title">' + $('#logo h1').html() + '</span>' +
				'</div>'
			)
				.appendTo($body);
		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'navPanel-visible'
				});
})(jQuery);