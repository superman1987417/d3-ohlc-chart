define([
    'd3',
    'components/sl',
    'MockData',
    'utils/tickWidth',
    'moment',
    'moment-range',
    'components/comparisonSeries',
    'components/ohlcBarSeries'
], function (d3, sl, MockData, tickWidth, moment) {
    'use strict';



    var mockData = new MockData(0, 0.1, 100, 50, function (moment) {
        return !(moment.day() === 0 || moment.day() === 6);
    });

    var fromDate = new Date(2012, 8, 1),
        toDate = new Date(2014, 8, 1);

    // var data = mockData.generateOHLC(fromDate, toDate);
    

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var xScale = d3.time.scale(),
        yScale = d3.scale.linear();

    var oldScale;

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

    var series = sl.series.ohlcBar()
        .xScale(xScale)
        .yScale(yScale)
        .tickWidth(tickWidth(xScale, fromDate, toDate));

    var line_series = sl.series.comparison()
        .xScale(xScale)
        .yScale(yScale);

    var zoom = d3.behavior.zoom()
        .x(xScale)
        .scaleExtent([0.5, 500])
        .on('zoom', zoomed)
        .on('zoomend', zoomend);

    var ohlcData;
    var lineData = [];

    var isFromZero = false;
    

    function updateChart(isFromZero) {               
        d3.select('#chart').selectAll("*").remove();
        // Create svg element

        var clipDiv = d3.select('#chart').classed('chart', true).append('div')
            .attr('id', 'series-clip')
            .style('position', 'absolute')
            .style('overflow', 'hidden')
            .style('top', margin.top + 'px')
            .style('left', margin.left + 'px');


        var seriesDiv = clipDiv.append('div')
            .attr('id', 'series-container');

        var svg = d3.select('#chart').append('svg')
            .style('position', 'absolute')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        var seriesSvg = seriesDiv.append('svg')
            .attr('width', width)
            .attr('height', height);

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

        plotArea.append('rect')
            .attr('class', 'zoom-pane')
            .attr('width', width)
            .attr('height', height)
            .call(zoom);

        // ohlcData = mockData.generateOHLC(fromDate, toDate);        

        console.log('data');
        console.log(ohlcData);
        console.log(lineData);

        // Set scale domains
        xScale.domain(d3.extent(ohlcData, function (d) {
            return d.date;
        }));

        var rangeData = getRangeData(lineData);
        console.log('rangeData');
        console.log(rangeData);

        var min_max_obj = getMinMaxValue(ohlcData, rangeData);   

        console.log('min max data');
        console.log(min_max_obj);
        

        yScale.domain(
            [
                min_max_obj.min,
                min_max_obj.max
            ]
        );

        // yScale.domain(
        //     [
        //         d3.min(ohlcData, function (d) {
        //             return d.low;
        //         }),
        //         d3.max(ohlcData, function (d) {
        //             return d.high;
        //         })
        //     ]
        // );

        // Set scale ranges
        xScale.range([0, width]);
        yScale.range([height, 0]);

        // yScale.domain([0, 300]);
        if(isFromZero) {
            yScale.domain([0, min_max_obj.max]);    
        }

        zoom.x(xScale);
        oldScale = yScale.copy();

        // Draw axes
        g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        g.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        // Draw series.
        seriesSvg.append('g')
            .attr('class', 'series')
            .datum(ohlcData)
            .call(series);

        // display all part of chart
        zoomend();


        // draw line graph
        // lineData = [
        //     {
        //         "color": "#7CFC00",
        //         "data": [
        //             {
        //                 "value": 50.0,
        //                 "date": "2018-02-17",
        //                 "id": 1,
        //                 "filterx": "line1"
        //             },
        //             {
        //                 "value": 55.0,
        //                 "date": "2018-02-16",
        //                 "id": 2,
        //                 "filterx": "line1"
        //             },
        //             {
        //                 "value": 60.0,
        //                 "date": "2018-02-15",
        //                 "id": 3,
        //                 "filterx": "line1"
        //             },
        //             {
        //                 "value": 80.0,
        //                 "date": "2018-02-14",
        //                 "id": 4,
        //                 "filterx": "line1"
        //             },
        //             {
        //                 "value": 50.0,
        //                 "date": "2018-02-13",
        //                 "id": 5,
        //                 "filterx": "line1"
        //             }
        //         ],
        //         "type": "drawLine"
        //     },
        //      {
        //         "color": "#00BFFF",
        //         "data": [
        //             {
        //                 "value": 110.0,
        //                 "date": "2018-02-17",
        //                 "id": 6,
        //                 "filterx": "line2"
        //             },
        //             {
        //                 "value": 110.0,
        //                 "date": "2018-02-16",
        //                 "id": 7,
        //                 "filterx": "line2"
        //             },
        //             {
        //                 "value": 150.0,
        //                 "date": "2018-02-15",
        //                 "id": 8,
        //                 "filterx": "line2"
        //             },
        //             {
        //                 "value": 100.0,
        //                 "date": "2018-02-14",
        //                 "id": 9,
        //                 "filterx": "line2"
        //             },
        //             {
        //                 "value": 100.0,
        //                 "date": "2018-02-13",
        //                 "id": 10,
        //                 "filterx": "line2"
        //             }
        //         ],
        //         "type": "drawLine"
        //     }
        // ];

        // for(var i=0; i < lineData.length; i++) {
        //     lineData[i].data.forEach(function(element) {
        //         element.date = new Date(element.date);
        //         // console.log(element);
        //     });
        // }

        lineData = lineData.map(function (ele, idx) {
            return {
                name: "Series " + (idx + 1) ,
                data: ele.data,
                color: ele.color

            };
        });

        if(lineData.length > 0) {
            seriesSvg.append('g')
                .attr('class', 'line-series')
                .datum(lineData)
                .call(line_series);
        }       

        

    }

    function getMinMaxValue(ohlcData, lineData) {
        var min_ohlc = d3.min(ohlcData, function (d) {
                    return d.low;
                });

        var max_ohlc = d3.max(ohlcData, function (d) {
                    return d.high;
                });

        if(lineData.length > 0) {
            var min_line = d3.min(lineData, function (d) {
                    return d;
                });

            var max_line = d3.max(lineData, function (d) {
                    return d;
                });    

            return {
                min: Math.min(min_ohlc, min_line),
                max: Math.max(max_ohlc, max_line)
            }        
        } else {
            return {
                min: min_ohlc,
                max: max_ohlc
            }        
        }
        
    }

    function getRangeData(lineData) {        
        var rangeData = [];        
        if(lineData.length >0) {
            lineData.forEach(function(ele) {            
                ele.data.forEach(function(sub) {
                    rangeData.push(sub.value);
                });
            });
        }
        
        
        return rangeData;
    }
    

    function zoomed() {
        // zoom function for ohlc graph
        var yTransformTranslate = 0,
            yTransformScale,
            xTransformTranslate = d3.event.translate[0],
            xTransformScale = d3.event.scale;

        var xDomain = xScale.domain();
        var range = moment().range(xDomain[0], xDomain[1]);
        var rangeData = [];

        var oldDomain = oldScale.domain();

        var g = d3.selectAll('svg').select('g');
        var seriesDiv = d3.selectAll('#series-container');
        var transform;

        for (var i = 0; i < ohlcData.length; i += 1) {
            if (range.contains(ohlcData[i].date)) {
                rangeData.push(ohlcData[i]);
            }
        }

        var rangeLineData = [];

        if(lineData.length > 0) {
            lineData.forEach(function(ele) {            
                ele.data.forEach(function(sub) {
                    if (range.contains(sub.date)) {
                        rangeLineData.push(sub.value);
                    }                
                });
            });
        }
        

        var min_max_obj = getMinMaxValue(rangeData, rangeLineData);   

        // yScale.domain(
        //     [
        //         d3.min(rangeData, function (d) {
        //             return d.low;
        //         }),
        //         d3.max(rangeData, function (d) {
        //             return d.high;
        //         })
        //     ]
        // );

        yScale.domain(
            [
                min_max_obj.min,
                min_max_obj.max
            ]
        );

        if(isFromZero) {
            yScale.domain([0, min_max_obj.max]);    
        }

        g.select('.x.axis')
            .call(xAxis);

        g.select('.y.axis')
            .call(yAxis);

        yTransformScale = (oldDomain[1] - oldDomain[0]) / (yScale.domain()[1] - yScale.domain()[0]);

        if (yScale.domain()[1] !== oldDomain[1]) {
            yTransformTranslate = oldScale(oldDomain[1]) - oldScale(yScale.domain()[1]) ;
            yTransformTranslate *= yTransformScale;
        }

        seriesDiv = document.getElementById('series-container');

        transform = 'translate3d(' + xTransformTranslate + 'px,' + yTransformTranslate  + 'px, 0px) scale3d(' + xTransformScale + ',' + yTransformScale + ', 1)';
        seriesDiv.style.webkitTransform = transform;
        seriesDiv.style.webkitTransformOrigin = "0 0";
        seriesDiv.style.MozTransform = transform;
        seriesDiv.style.MozTransformOrigin = "0 0";

    }

    function zoomend() {
        var xDomain = xScale.domain();
        var seriesDiv = d3.select('#series-container');
        var nullTransform =  'translate3d(0,0,0) scale3d(1,1,1)';

        oldScale = yScale.copy();

        zoom.x(xScale);
        series.tickWidth(tickWidth(xScale, xDomain[0], xDomain[1]));

        seriesDiv.select('.series')
            .call(series);

        //add zoom function for line graph        

        seriesDiv.select('.line-series')
            .call(line_series);
        // end zoom function for line graph

        seriesDiv = document.getElementById('series-container');
        seriesDiv.style.webkitTransform = nullTransform;
        seriesDiv.style.MozTransform = nullTransform;

    }

    function fetchData (targetUrl) {
        $.ajax({
            type: "GET",
            url: targetUrl,
            data: $('#user_form').serialize(),
            success: function( data, textStatus, jqXHR ) {                                  
                // if(jqXHR.status == 201) {       
                // }
                console.log("response data");                
                console.log(data);                

                // jQuery.parseJSON(data);                  
                for (var prop in data) {                    
                    
                    if(data[prop].type == "ohlc") {
                        if((data[prop].data) && (data[prop].data.length > 0)) {
                            data[prop].data.forEach(function(element) {
                                element.date = new Date(element.date);
                                // console.log(element);
                            });
                            ohlcData = data[prop].data;
                        }                       
                        
                    }

                    if(data[prop].type == "drawLine") {                
                        if((data[prop].data) && (data[prop].data.length > 0)) {        
                            data[prop].data.forEach(function(element) {
                                element.date = new Date(element.date);
                                // console.log(element);
                            });
                            lineData.push(data[prop]);
                        }
                    }
                }

                updateChart(isFromZero);               

                // updateChart();
                $("#update-btn").css("visibility", "visible");

            },
            error: function (xhr, ajaxOptions, thrownError) {
                // if(xhr.status == 400) {                        
                // }                    
            }

        }); 
    }

    $(function() {        
        var url1 = 'http://185.194.141.182:8000/error/?format=json';
        var url2 = 'http://185.194.141.182:8000/?format=json';
        fetchData(url2);
        
        $("#update-btn").unbind("click").bind("click", function() {
            updateChart(isFromZero);
        });

        isFromZero = $("#isFromZero").prop("checked");

        $("#isFromZero").on("change", function() {            
            isFromZero = $("#isFromZero").prop("checked");            
            updateChart(isFromZero);
        })


    })


});
