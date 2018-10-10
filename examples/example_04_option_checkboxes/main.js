"use strict";

var SHOW_LABELS = true;
var MASK_VIEW = true;


// define the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// Get some data, minutes : HR
function makeMeSomeData(){
  var integers = dataGen(5000, 50, 140, 10);
  var time = 0;
  var dataArray = integers.map(function(int){
    time += 10 + (Math.random() * 10)
    return {"time":time, "value":int}
  })
  return [ dataArray ];
}
var dataStore = {};
dataStore.raw = makeMeSomeData()

dataStore.crop = function(){
  series = this.raw[0]
  var bisector = d3.bisector(function(d){return d.time})
  var leftEdge = bisector.left(series, this.domain[0]) -1
  var rightEdge = bisector.right(series, this.domain[1]) +1
  if(leftEdge < 0) leftEdge = 0;

  var sliced = [series.slice(leftEdge, rightEdge)];
  return sliced
}

var peakFinder = d3_peaks.findPeaks()
    .kernel(d3_peaks.ricker)
    .gapThreshold(3)
    .minLineLength(3)
    .minSNR(3)
    .widths([2, 3, 4, 5]);

dataStore.getLabels = function(){
  // return a data list of the points that should have labels.

  series = this.compiled[0]
  // var min = series[d3.scan(series, function(a, b) { return a.value - b.value; })]
  // min.position = "bottom"
  // var max = series[d3.scan(series, function(a, b) { return b.value - a.value; })]
  // max.position = "top"
  var rightMost = series[series.length -1]
  rightMost.position = "top"
  // var needLabels = new Set([min, max, rightMost])
  // return Array.from(needLabels)

  // find maxima
  var signal = series.map(function(d){return d.value})
  var indices = peakFinder(signal); // list of {index:, width:, snr:}
  var maxima = indices.map(function(d){
    var p = series[d.index]
    p.position = "top"
    return p
  })

  // find minima:
  var signal = series.map(function(d){return -d.value})
  var indices = peakFinder(signal); // list of {index:, width:, snr:}
  var minima = indices.map(function(d){
    var p = series[d.index]
    p.position = "bottom"
    return p
  })

  return d3.merge([maxima, minima, [rightMost]])
}

dataStore.data = function(){
  this.compiled = this.crop();
  return this.compiled
}

// define the scales
var series = dataStore.raw[0]
var timeRange = series[series.length-1].time - series[0].time
var xScale_initial = d3.scaleLinear()
  .range([0, width])
  .domain([timeRange/40*38, timeRange/40*39]);

var yScale_initial = d3.scaleLinear()
  .range([height, 0])
  .domain([0, d3.max(series, function(d) { return d.value; })]);

var xScale = xScale_initial.copy()
var yScale = yScale_initial.copy()

// define the series line
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

// Define labelling function
function applyLabels(selection){
  var newLabels = selection.enter()
      .append("g")
      .attr("class", "dataLabel")

  newLabels.append("text")
  newLabels.merge(selection)
      .attr("transform", function(d){ return "translate(" + xScale(d.time) + "," + yScale(d.value) + ")"; })
      .select("text")
      // .attr("x", function(d){ return xScale(d.time); })
      // .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("y", function(d){ if(d.position == "top") return -10; else return 20})
      .text(function(d){ return " " + d.value; })
  selection.exit().remove()
}

// append the svg object to the body of the page
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var view = svg.append("g")
    .attr("class", "view")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

var clipPath = view.append("defs").append("clipPath")
    .attr("id", "clip-chart-area")
clipPath.append("rect")
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

function render(){
  dataStore.domain = xScale.domain();
  var data = dataStore.data();

  yScale.domain([0, d3.max(data[0], function(d) { return d.value; })]);
  gY.call(yAxis.scale(yScale));

  // -- Clip Path --
  var seriesClipPathAttr;
  if( MASK_VIEW ){
    seriesClipPathAttr = "url(#clip-chart-area)"
  } else {
    seriesClipPathAttr = null
  }

  // -- Series --
  var paths = view.selectAll(".line").data(data)
  // ADD
  paths.enter()
      .append("path")
      .attr("class", "line")
  // UPDATE, with new nodes included
    .merge(paths)
      .attr("d", line)
      .attr("clip-path", seriesClipPathAttr)

  // -- Line Annotations --
  var annotationLines = view.selectAll(".annotationLine").data([{"value":60}, {"value":100}])
  annotationLines.enter()
    .append("line")
      .attr("class", "annotationLine")
    .merge(annotationLines)
      .attr("x1", xScale.range()[0])
      .attr("y1", function(d){ return yScale(d.value); })
      .attr("x2", xScale.range()[1])
      .attr("y2", function(d){ return yScale(d.value); })
  annotationLines.exit().remove()

  // -- Labels --
  if( SHOW_LABELS ) {
    var labeledPoints = dataStore.getLabels()
  } else {
    var labeledPoints = []
  }
  var labels = view.selectAll(".dataLabel").data(labeledPoints).call(applyLabels)

}
render()

var zoomArea = view.append("rect")
  .attr("class", "zoom")
  .attr("width", width)
  .attr("height", height)
  .call(zoom)

function zoomed() {
  var t = d3.event.transform;
  xScale = t.rescaleX(xScale_initial);

  gXAxis.call(xAxis.scale(xScale));
  gXGridlines.call(xGridlines.scale(xScale));

  render()
}

function resetZoom() {
  view.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
}

function onclick_toggleLabels(e){
 SHOW_LABELS = e.checked
 render()
}
function onclick_toggleClipView(e){
 MASK_VIEW = e.checked
 render()
}
