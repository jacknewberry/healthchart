"use strict";

function dataGen(count, min, max, volatility) {
  var data = [min + (Math.random() * (max-min)) | 0 ]
  var next
  var walk = 0
  for ( var i=1; i<count; i++){
    walk = (walk * 0.5) + ((Math.random() - 0.5) * volatility)
    next = data[data.length-1] + walk
    if(next < min || next > max) { next -= walk*2 }
    data.push(next | 0)
  }
  return data
};
