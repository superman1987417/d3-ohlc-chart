define([
    'd3',
    'components/sl',
    'MockData',
    'components/comparisonSeries',
    'components/gridlines'
], function (d3, sl, MockData) {
    'use strict';

    return function (zoomMethod) {
        var mockData = new MockData(0, 0.1, 100, 50, function (moment) {
            return !(moment.day() === 0 || moment.day() === 6);
        });

        var fromDate = new Date(2018, 1, 10),
            toDate = new Date(2018, 1, 18);

        var names = ['Series 1', 'Series 2', 'Series 3'];

        // var data = names.map(function (name) {
        //     return {
        //         name: name,
        //         data: mockData.generateOHLC(fromDate, toDate)
        //     };
        // });

        var data = [
            {
                "color": "#7CFC00",
                "data": [
                    {
                        "value": 50.0,
                        "date": "2018-02-17",
                        "id": 1,
                        "filterx": "line1"
                    },
                    {
                        "value": 55.0,
                        "date": "2018-02-16",
                        "id": 2,
                        "filterx": "line1"
                    },
                    {
                        "value": 60.0,
                        "date": "2018-02-15",
                        "id": 3,
                        "filterx": "line1"
                    },
                    {
                        "value": 80.0,
                        "date": "2018-02-14",
                        "id": 4,
                        "filterx": "line1"
                    },
                    {
                        "value": 50.0,
                        "date": "2018-02-13",
                        "id": 5,
                        "filterx": "line1"
                    }
                ],
                "type": "drawLine"
            },
             {
                "color": "#00BFFF",
                "data": [
                    {
                        "value": 110.0,
                        "date": "2018-02-17",
                        "id": 6,
                        "filterx": "line2"
                    },
                    {
                        "value": 110.0,
                        "date": "2018-02-16",
                        "id": 7,
                        "filterx": "line2"
                    },
                    {
                        "value": 150.0,
                        "date": "2018-02-15",
                        "id": 8,
                        "filterx": "line2"
                    },
                    {
                        "value": 100.0,
                        "date": "2018-02-14",
                        "id": 9,
                        "filterx": "line2"
                    },
                    {
                        "value": 100.0,
                        "date": "2018-02-13",
                        "id": 10,
                        "filterx": "line2"
                    }
                ],
                "type": "drawLine"
            }
        ];

        for(var i=0; i < data.length; i++) {
            data[i].data.forEach(function(element) {
                element.date = new Date(element.date);
                // console.log(element);
            });
        }

        data = data.map(function (ele, idx) {
            return {
                name: "Series " + (idx + 1) ,
                data: ele.data,
                color: ele.color

            };
        });
        
        // for(var i=0; i < names.length; i++) {
        //     var mydata = data[i].data.map(function(ele) {
        //         return {
        //             date: ele.date,
        //             open: ele.open,  //high, low, close
        //         }            
        //     });    

        //     data[i].data = mydata;
        // }

        console.log(data);



        var xScale = d3.time.scale(),
            yScale = d3.scale.linear();

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(5);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');            

        var series = sl.series.comparison()
            .xScale(xScale)
            .yScale(yScale);

        var gridlines = sl.svg.gridlines()
            .xScale(xScale)
            .yScale(yScale)
            .xTicks(10)
            .yTicks(5);

        var zoom = d3.behavior.zoom()
            .x(xScale)
            .scaleExtent([1, 50])
            .on('zoom', zoomed)
            .on('zoomend', zoomend);

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 680 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Create svg element
        var svg = d3.select('#chart').classed('chart', true).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        // Ceate chart
        var g = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Create plot area
        var plotArea = g.append('g');
        plotArea.append('clipPath')
            .attr('id', 'plotAreaClip')
            .append('rect')
            .attr({ width: width, height: height });
        plotArea.attr('clip-path', 'url(#plotAreaClip)');

        // Create zoom pane
        plotArea.append('rect')
            .attr('class', 'zoom-pane')
            .attr('width', width)
            .attr('height', height)
            .call(zoom);

        // Set scale domain

        xScale.domain([fromDate, toDate]);

        var xWidth = xScale(toDate);
        xScale.domain([xScale.invert(xWidth / 4), xScale.invert(xWidth - (xWidth / 4))]);

        // Set scale ranges
        xScale.range([0, width]);
        yScale.range([height, 0]);
        
        console.log(xScale.domain()[0]);
        console.log(xScale.domain()[1]);
        console.log(fromDate);
        console.log(toDate);

        // Reset zoom.
        zoom.x(xScale);

        // Draw series.
        plotArea.append('g')
            .attr('class', 'series')
            .datum(data)
            .call(series);

        // Draw axes
        g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        g.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        // Draw gridlines
        plotArea
            .call(gridlines);

        function zoomed() {

            var xDomain = xScale.domain();
            var xRange = xScale.range();
            var translate = zoom.translate()[0];

            if (xDomain[0] < fromDate) {
                translate = translate - xScale(fromDate) + xRange[0];
            } else if (xDomain[1] > toDate) {
                translate = translate - xScale(toDate) + xRange[1];
            }
            zoom.translate([translate, 0]);

            if (zoomMethod === "Geometric") {
                series.geometricZoom(g.select('.series'), translate, d3.event.scale);
            } else {
                g.select('.series')
                    .call(series);
            }

            g.select('.x.axis')
                .call(xAxis);

            g.select('.y.axis')
                .call(yAxis);

            plotArea
                .call(gridlines);
        }

        function zoomend() {
        }
    };
});
