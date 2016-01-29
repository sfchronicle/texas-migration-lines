var ich = require("icanhaz");
var $ = require("jquery");
var tooltipTemplate = require("./_tooltipTemplate.html");
ich.addTemplate("tooltipTemplate", tooltipTemplate);

var counties = [
  { name: "Bay Area Total", color: "#666666" },
  // { name: "Alameda", color: "#69AF7E" },
  // { name: "Contra Costa", color: "#44AFA8" },
  // { name: "Marin", color: "#68B0AB" },
  // { name: "San Francisco", color: "#72BF9B" },
  // { name: "San Mateo", color: "#8FC0A9" },
  // { name: "Santa Clara", color: "#C8D5B9" },
  // { name: "Solano", color: "#F9EEC5" }
];

var years = [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012];
var num_years = 16;
var toggle1 = 1;
var toggle2 = 0;
var toggle3 = 0;
var toggle4 = 0;
var toggle5 = 0;
var toggle6 = 0;
var toggle7 = 0;
var toggle8 = 0;
//THERE IS STILL A HARD-CODED VALUE AT 64-65 WHICH YOU SHOULD FIX!!!!

//setting some important variables
// var vertical_inc = 1000;
// var top_percent = 9000;
// var num_inc = 14;
// var yaxis_label_offset = 60;
// var zero_line = 9; //number of tick marks before zero

var vertical_inc = 50;
var top_percent = 200;
var num_inc = 8;
var yaxis_label_offset = 40;
var zero_line = 4; //number of tick marks before zero

// color variables
//@fill = "rgb(66, 70, 72)";

var width = 620;
var height = 320;
var leftOffset = 50;
var topOffset = 5;
var chartHeight = 280;
var chartWidth = width - leftOffset;
var indexWidth = chartWidth / num_years;
var indexHeight = chartHeight / num_inc;

var canvas = document.querySelector("canvas");
if (canvas) {
  var ctx = canvas.getContext("2d");

  var render = function(index) {
    ctx.clearRect(0, 0, width, height);

    // hover bars
    if (typeof index !== "undefined") {
      ctx.fillStyle = "rgb(248, 248, 248)";
      ctx.fillRect(index * indexWidth + leftOffset, topOffset, indexWidth, height);
      ctx.fillStyle = "rgba(176,176,187,.6)";
      ctx.fillRect(index * indexWidth + leftOffset, height-35, indexWidth, height);
    }

    // graph lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(192, 192, 192)';
    ctx.lineWidth = 1;
    ctx.moveTo(leftOffset, topOffset);
    ctx.lineTo(chartWidth + leftOffset, topOffset);
    for (var i = 1; i < (num_inc+1); i++) {
      ctx.moveTo(leftOffset,indexHeight*i + topOffset);
      ctx.lineTo(chartWidth + leftOffset, indexHeight * i + topOffset);
    };
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgb(126, 131, 139)';
    ctx.lineWidth = 2;
    ctx.moveTo(leftOffset, indexHeight*zero_line + topOffset);
    ctx.lineTo(chartWidth + leftOffset, indexHeight*zero_line + topOffset);
    ctx.stroke();

    // year labels
    var i = indexWidth/2 + leftOffset;
    //ctx.font = "bold 14px helvetica";
    ctx.font ="13px helvetica";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";
    years.forEach(function(year){
      ctx.fillText(year, i, height - 18); //WHAT IS THIS "18"??????????
      i += indexWidth;
    });

    // percent labels
    var percent = top_percent;
    ctx.font = "13px helvetica";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillStyle = "#000000";
    for (var i = 0; i < (num_inc+1); i++) {
      ctx.fillText(percent, yaxis_label_offset, indexHeight * i + topOffset);
      percent -= vertical_inc;
    };

    // percent label name
    ctx.rotate(-(Math.PI/180)*90);
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000000";
    ctx.font = "12px helvetica";
    ctx.fillText("Taxable Income (Millions)", -(chartHeight/2 + topOffset), 0);
    ctx.rotate((Math.PI/180)*90);

    //explanatory lines
    drawArrow(chartWidth-10,indexHeight*(zero_line-1) + topOffset, chartWidth-10, indexHeight*(zero_line-3) + topOffset);
    drawArrow(yaxis_label_offset+40,indexHeight*(zero_line+1) + topOffset, yaxis_label_offset+40, indexHeight*(zero_line+3) + topOffset);

    //explanatory text
    ctx.font = "13px helvetica";
    ctx.strokeStyle = "#000000";
    ctx.fillText("Wealth flowing from Texas to Bay Area", chartWidth-70, indexHeight*(zero_line-3.8) + topOffset);
    ctx.fillText("Wealth flowing from Bay Area to Texas", yaxis_label_offset+130, indexHeight*(zero_line+3.3) + topOffset);


    // data lines
    counties.forEach(function(county) {
      var points = [];
      years.forEach(function(year) {
        var point = MigrationData[county.name][year].percent;
        points.push(point);
      });

      ctx.beginPath();
      // ctx.strokeStyle = "rgb(" + county.color + ")";
      ctx.strokeStyle = county.color;
      if (county.name == "Bay Area Total") {
        ctx.lineWidth = 3;
      } else {
        ctx.lineWidth = 1.75;
      }
      var i = indexWidth/vertical_inc + leftOffset;
      points.forEach(function(point) {
        var y = indexHeight*zero_line - (point * indexHeight/vertical_inc) + topOffset;
        ctx.lineTo(i+indexWidth/2, y);
        ctx.stroke();
        i += indexWidth;
      });
    });

  };

  render();

  var tooltip = document.querySelector(".tooltip");

  var onmove = function(e) {
    var indexWidth = (canvas.offsetWidth - leftOffset) / num_years;

    if (e.target.tagName.toLowerCase() != "canvas") return;
    var position;
    var bounds = canvas.getBoundingClientRect();
    position = {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    };

    var index = Math.floor((position.x - leftOffset)/ indexWidth);
    var year = (index + 1997).toString();

    if (index >= 0) {
      tooltip.classList.add("show");

      var values = [];
      counties.forEach(function(county) {
        if (county) {
          var name = county.name;
          var color = county.color;
          var AGI = MigrationData[county.name][year].AGI;
          var percent = MigrationData[county.name][year].percent;
          if (!percent == 0) {
            var up = percent > 0;
            var down = percent < 0;
            var formattedPercent = percent.toString();
            //var formattedPercent = percent.toString().replace("-", "");
          }
          values.push({
            name: name,
            color: color,
            AGI: AGI,
            percent: formattedPercent,
            up: up,
            down: down,
            bold: county.name == "Bay Area Total"
          });
        }
      });

      render(index);

      tooltip.innerHTML = ich.tooltipTemplate({year: year, data: values});

      var tBounds = tooltip.getBoundingClientRect();
      var y = position.y < (bounds.height/2) ? indexHeight : -tBounds.height - indexHeight;
      var x = position.x < (bounds.width/2) ? indexHeight : -tBounds.width - indexHeight;
      tooltip.style.top = e.pageY + y + "px";
      tooltip.style.left = e.pageX + x + "px";
    } else {
      tooltip.classList.remove("show");
    }
  };

  canvas.addEventListener("mousemove", onmove);
  canvas.addEventListener("click", onmove);
  canvas.addEventListener("mouseout", function(e) {
    render();
    tooltip.classList.remove("show");
  });

  function drawArrow(fromx, fromy, tox, toy){
      //variables to be used when creating the arrow
      var headlen = 3;

      var angle = Math.atan2(toy-fromy,tox-fromx);

      //starting path of the arrow from the start square to the end square and drawing the stroke
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      //starting a new path from the head of the arrow to one of the sides of the point
      ctx.beginPath();
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

      //path from the side point of the arrow, to the other side point
      ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

      //path from the side point back to the tip of the arrow, and then again to the opposite side point
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

      //draws the paths created above
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.fillStyle = "#000000";
      ctx.fill();
  }

}

$(".bay").click(function() {
    if (toggle1) {
      for(var i = 0; i < counties.length; i++) {
        if(counties[i].name == "Bay Area Total") {
            counties.splice(i, 1);
            break;
        }
      }
    } else {
      counties.push({ name: "Bay Area Total", color: "#666666" });
    }
    render();
    toggle1 = !toggle1;
});

$(".alameda").click(function() {
  if (toggle2) {
    for(var i = 0; i < counties.length; i++) {
      if(counties[i].name == "Alameda") {
          counties.splice(i, 1);
          break;
      }
    }
  } else {
    counties.push({ name: "Alameda", color: "#69AF7E" });
  }
  render();
  toggle2 = !toggle2;
});

$(".cc").click(function() {
  if (toggle3) {
    for(var i = 0; i < counties.length; i++) {
      if(counties[i].name == "Contra Costa") {
          counties.splice(i, 1);
          break;
      }
    }
  } else {
    counties.push({ name: "Contra Costa", color: "#44AFA8" });
  }
  render();
  toggle3 = !toggle3;
});

$(".marin").click(function() {
  if (toggle4) {
    for(var i = 0; i < counties.length; i++) {
      if(counties[i].name == "Marin") {
          counties.splice(i, 1);
          break;
      }
    }
  } else {
    counties.push({ name: "Marin", color: "#68B0AB" });
  }
  render();
  toggle4 = !toggle4;
});

$(".sf").click(function() {
  if (toggle5) {
    for(var i = 0; i < counties.length; i++) {
      if(counties[i].name == "San Francisco") {
          counties.splice(i, 1);
          break;
      }
    }
  } else {
    counties.push({ name: "San Francisco", color: "#72BF9B" });
  }
  render();
  toggle5 = !toggle5;
});

$(".sm").click(function() {
  if (toggle6) {
    for(var i = 0; i < counties.length; i++) {
      if(counties[i].name == "San Mateo") {
          counties.splice(i, 1);
          break;
      }
    }
  } else {
    counties.push({ name: "San Mateo", color: "#8FC0A9" });
  }
  render();
  toggle6 = !toggle6;
});

$(".sc").click(function() {
  if (toggle7) {
    for(var i = 0; i < counties.length; i++) {
      if(counties[i].name == "Santa Clara") {
          counties.splice(i, 1);
          break;
      }
    }
  } else {
    counties.push({ name: "Santa Clara", color: "#C8D5B9" });
  }
  render();
  toggle7 = !toggle7;
});

$(".solano").click(function() {
  if (toggle8) {
    for(var i = 0; i < counties.length; i++) {
      if(counties[i].name == "Solano") {
          counties.splice(i, 1);
          break;
      }
    }
  } else {
    counties.push({ name: "Solano", color: "#F9EEC5" });
  }
  render();
  toggle8 = !toggle8;
});
