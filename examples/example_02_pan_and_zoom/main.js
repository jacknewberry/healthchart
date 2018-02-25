"use strict";

// define the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// Get some data, minutes : HR
var integers = dataGen(100, 50, 140, 10)
var time = 0
var data = integers.map(function(int){
  time += 10 + (Math.random() * 10)
  return {"time":time, "value":int}
})

// define the scales
var timeRange = data[data.length-1].time - data[0].time
var xScale_initial = d3.scaleLinear()
  .range([0, width])
  .domain([timeRange/4, timeRange/4*3]);

var yScale_initial = d3.scaleLinear()
  .range([height, 0])
  .domain([0, d3.max(data, function(d) { return d.value; })]);

var xScale = xScale_initial.copy()
var yScale = yScale_initial.copy()

// define the line
var line = d3.line()
    .x(function(d) { return xScale(d.time); })
    .y(function(d) { return yScale(d.value); });

// Define the Axes
var xAxis = d3.axisBottom(xScale)
var yAxis = d3.axisLeft(yScale)

var xGridlines = d3.axisBottom(xScale)
    .tickSizeInner(-height, 0)
    .tickFormat("");

var zoom = d3.zoom().on("zoom", zoomed)

// append the svg object to the body of the page
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var view = svg.append("g")
    .attr("class", "view")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

view.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var gX = view.append("g")
    .attr("class", "x")
    .attr("transform", "translate(0," + height + ")")
var gXAxis = gX.append("g")
    .attr("class", "axis")
    .call(xAxis)
var gXGridlines = gX.append("g")
    .attr("class", "gridlines")
    .call(xGridlines);


var gY = view.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

// Add the line
view.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

var zoomArea = view.append("rect")
  .attr("class", "zoom")
  .attr("width", width)
  .attr("height", height)
  .call(zoom)

function zoomed() {
  var t = d3.event.transform;
  xScale = t.rescaleX(xScale_initial);
  // yScale = t.rescaleY(yScale_initial);

  gXAxis.call(xAxis.scale(xScale));
  gXGridlines.call(xGridlines.scale(xScale));
  // gY.call(yAxis.scale(yScale));

  view.select(".line").attr("d", line)
}

function resetZoom() {
  view.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
}
