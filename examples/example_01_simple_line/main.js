"use strict";

// define the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// define the scales
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.value); });

// Get some data, minutes : HR
var integers = dataGen(100, 50, 140, 10)
var time = 0
var data = integers.map(function(int){
  time += 10 + (Math.random() * 10)
  return {"time":time, "value":int}
})


// Set the domains
//var timeRange = data[data.length-1].time - data[0].time
//x.domain([timeRange/4, timeRange/4*3]);
x.domain([d3.min(data, function(d){return d.time}), d3.max(data, function(d){return d.time})]);
y.domain([0, d3.max(data, function(d) { return d.value; })]);

// append the svg obgect to the body of the page
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Add the valueline path.
svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", valueline);

// Add the X Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Add the Y Axis
svg.append("g")
    .call(d3.axisLeft(y));
