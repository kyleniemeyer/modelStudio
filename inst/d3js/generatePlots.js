//:\\\ here are functions for modelStudio plots //:\\\

// model specific data and other variables come from modelStudio.js file
// descriptions need to be IN plot functions because of tooltips

/// initialize plots, select them if already there
var BD, SV, CP, FI, PD, AD, FD;

/// later plot specific plotIds
var mapIdPlotFunction = {};

if (svg.select("#BD").empty()) {
  BD = svg.append("g")
              .attr("class","plot")
              .attr("id", "BD")
              .style("visibility", "hidden");
} else {
  BD = svg.select("#BD");
}
mapIdPlotFunction.BD = breakDown;

if (svg.select("#SV").empty()) {
  SV = svg.append("g")
          .attr("class","plot")
          .attr("id","SV")
          .style("visibility", "hidden");
} else {
  SV = svg.select("#SV");
}
mapIdPlotFunction.SV = shapValues;

if (svg.select("#CP").empty()) {
  CP = svg.append("g")
          .attr("class","plot")
          .attr("id", "CP")
          .style("visibility", "hidden");
} else {
  CP = svg.select("#CP");
}
mapIdPlotFunction.CP = ceterisParibus;

if (svg.select("#FI").empty()) {
  FI = svg.append("g")
          .attr("class","plot")
          .attr("id","FI")
          .style("visibility", "hidden");
} else {
  FI = svg.select("#FI");
}
mapIdPlotFunction.FI = featureImportance;

if (svg.select("#PD").empty()) {
  PD = svg.append("g")
          .attr("class","plot")
          .attr("id","PD")
          .style("visibility", "hidden");
} else {
  PD = svg.select("#PD");
}
mapIdPlotFunction.PD = partialDependency;

if (svg.select("#AD").empty()) {
  AD = svg.append("g")
          .attr("class","plot")
          .attr("id","AD")
          .style("visibility", "hidden");
} else {
  AD = svg.select("#AD");
}
mapIdPlotFunction.AD = accumulatedDependency;

if (svg.select("#FD").empty()) {
  FD = svg.append("g")
          .attr("class","plot")
          .attr("id","FD")
          .style("visibility", "hidden");
} else {
  FD = svg.select("#FD");
}
mapIdPlotFunction.FD = featureDistribution;

/// general plot functions

function breakDown() {

  let tObservationId = CLICKED_OBSERVATION_ID,
      tData = obsData[tObservationId];

  var bdData = tData[0],
      bData = bdData.x;
      bdBarCount = bdData.m[0],
      xMinMax = bdData.x_min_max,
      desc = bdData.desc;

  var bdPlotHeight = SCALE_PLOT ? h : bdBarCount*bdBarWidth + (bdBarCount+1)*bdBarWidth/2,
      bdPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left,  margin.left + bdPlotWidth])
            .domain([xMinMax[0], xMinMax[1]]);

  BD.append("text")
    .attr("transform",
          "translate(" + (margin.left + bdPlotWidth/2) + " ," +
                         (margin.top + bdPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text("contribution");

  var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickSize(0);

  xAxis = BD.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0," + (margin.top + bdPlotHeight) + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove());

  var y = d3.scaleBand()
            .rangeRound([margin.top - additionalHeight, margin.top + bdPlotHeight])
            .padding(0.33)
            .domain(bData.map(d => d.variable));

  var xGrid = BD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + (margin.top + bdPlotHeight) + ")")
                .call(d3.axisBottom(x)
                        .ticks(10)
                        .tickSize(-bdPlotHeight-additionalHeight)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yGrid = BD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .tickSize(-bdPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .tickSize(0);

  yAxis = BD.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + (margin.left - 10) + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  yAxis.select(".tick:last-child").select("text").attr('font-weight', 600);

  // wrap y label text
  yAxis.selectAll("text").call(wrapText, margin.left - 15);

  BD.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 15)
    .attr("class", "smallTitle")
    .text(bdSubtitle);

  BD.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .attr("class", "bigTitle")
    .text(bdTitle);

  // add tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipBD")
                  .html(d => d.type === "desc"
                             ? descTooltipHtml(d) : bdTooltipHtml(d));

  BD.call(tooltip);

  // find boundaries
  let intercept = bData[0].contribution > 0
                  ? bData[0].barStart
                  : bData[0].barSupport;

  // make dotted line from intercept to prediction
  var dotLineData = [{"x": x(intercept), "y": y("intercept")},
                     {"x": x(intercept), "y": y("prediction") + y.bandwidth()}];

  var lineFunction = d3.line()
                       .x(d => d.x)
                       .y(d => d.y);

  BD.append("path")
    .data([dotLineData])
    .attr("class", "dotLine")
    .attr("d", lineFunction)
    .style("stroke-dasharray", ("1, 2"));

  // add bars
  var bars = BD.selectAll()
               .data(bData)
               .enter()
               .append("g");

  bars.append("rect")
      .attr("class", modelName.replace(/\s/g,''))
      .attr("id", (d) => d.variable_name)
      .attr("fill", function(d) {
        switch (d.sign) {
          case "-1":
            return bdNegativeColor;
          case "1":
            return bdPositiveColor;
          default:
            return defaultColor;
        }
      })
      .attr("fill-opacity", d => x(d.barSupport) - x(d.barStart) < 1.5
                                 ? 0 : 1) //invisible bar for clicking purpose
      .attr("y", d => y(d.variable))
      .attr("height", y.bandwidth())
      .attr("x", d => d.contribution > 0 ? x(d.barStart) : x(d.barSupport))
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide)
      .on("click", function() {
        updatePlots(event = "variableChange",
                    variableName = this.id,
                    observationId = null,
                    plotId = null);
      })
      .transition()
      .duration(TIME)
      .delay((d,i) => i * TIME)
      .attr("x", d => x(d.barStart))
      .attr("width", d => x(d.barSupport) - x(d.barStart) < 1.5
                          ? 5 : x(d.barSupport) - x(d.barStart));

  // add labels to bars
  var ctbLabel = BD.selectAll()
                   .data(bData)
                   .enter()
                   .append("g");

  ctbLabel.append("text")
          .attr("class", "axisLabel")
          .attr("x", d => {
            switch(d.sign){
              case "X":
                return d.contribution < 0
                       ? x(d.barStart) - 5 : x(d.barSupport) + 5;
              default:
                return x(d.barSupport) + 5;
            }
          })
          .attr("y", d => y(d.variable) + y.bandwidth()/2)
          .attr("dy", "0.4em")
          .attr("text-anchor", d => d.sign == "X" && d.contribution < 0
                               ? "end" : null)
          .transition()
          .duration(TIME)
          .delay((d,i) => (i+1) * TIME)
          .text(d => {
            switch(d.variable){
              case "intercept":
              case "prediction":
                return d.cummulative;
              default:
                return d.sign === "-1" ? d.contribution : "+"+d.contribution;
            }
          });

  // add lines to bars
  var lines = BD.selectAll()
                .data(bData)
                .enter()
                .append("g");

  lines.append("line")
       .attr("class", "interceptLine")
       .attr("x1", d => d.contribution < 0 ? x(d.barStart) : x(d.barSupport))
       .attr("y1", d => y(d.variable))
       .attr("x2", d => d.contribution < 0 ? x(d.barStart) : x(d.barSupport))
       .attr("y2", d => y(d.variable))
       .transition()
       .duration(TIME)
       .delay((d,i) => (i+1) * TIME)
       .attr("y2", d => d.variable == "prediction"
                        ? y(d.variable) : y(d.variable) + y.bandwidth()*2.5);

  var description = BD.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + bdPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function shapValues() {

  let tObservationId = CLICKED_OBSERVATION_ID,
      tData = obsData[tObservationId];

  var svData = tData[2],
      bData = svData.x,
      svBarCount = svData.m[0],
      xMinMax = svData.x_min_max,
      desc = svData.desc;

  var svPlotHeight = SCALE_PLOT ? h : svBarCount*svBarWidth + (svBarCount+1)*svBarWidth/2,
      svPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left,  margin.left + svPlotWidth])
            .domain([xMinMax[0], xMinMax[1]]);

  SV.append("text")
    .attr("transform",
          "translate(" + (margin.left + svPlotWidth/2) + " ," +
                         (margin.top + svPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text("contribution");

  var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickSize(0);

  xAxis = SV.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0," + (margin.top + svPlotHeight) + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove());

  var y = d3.scaleBand()
            .rangeRound([margin.top - additionalHeight, margin.top + svPlotHeight])
            .padding(0.33)
            .domain(bData.map(d => d.variable));

  var xGrid = SV.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + (margin.top + svPlotHeight) + ")")
                .call(d3.axisBottom(x)
                        .ticks(10)
                        .tickSize(-svPlotHeight - additionalHeight)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yGrid = SV.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .tickSize(-svPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .tickSize(0);

  yAxis = SV.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + (margin.left - 10) + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  // wrap y label text
  yAxis.selectAll("text").call(wrapText, margin.left - 15);

  SV.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 15)
    .attr("class", "smallTitle")
    .text(svSubtitle);

  SV.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .attr("class", "bigTitle")
    .text(svTitle);

  // add tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipSV")
                  .html(d => d.type === "desc"
                             ? descTooltipHtml(d) : bdTooltipHtml(d));

  SV.call(tooltip);

  // add bars
  var bars = SV.selectAll()
               .data(bData)
               .enter()
               .append("g");

  bars.append("rect")
      .attr("class", modelName.replace(/\s/g,''))
      .attr("id", (d) => d.variable_name)
      .attr("fill", function(d) {
        switch (d.sign) {
          case "-1":
            return svNegativeColor;
          case "1":
            return svPositiveColor;
          default:
            return defaultColor;
        }
      })
      .attr("fill-opacity", d => x(d.barSupport) - x(d.barStart) < 1.5
                                 ? 0 : 1) //invisible bar for clicking purpose
      .attr("x", d => d.contribution > 0 ? x(d.barStart) : x(d.barSupport))
      .attr("y", d => y(d.variable))
      .attr("height", y.bandwidth())
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide)
      .on("click", function() {
        updatePlots(event = "variableChange",
                    variableName = this.id,
                    observationId = null,
                    plotId = null);
      })
      .transition()
      .duration(TIME)
      .delay((d,i) => i * TIME)
      .attr("x", d => x(d.barStart))
      .attr("width", d => x(d.barSupport) - x(d.barStart) < 1.5
                          ? 5 : x(d.barSupport) - x(d.barStart));

  // add labels to bars
  var ctbLabel = SV.selectAll()
                   .data(bData)
                   .enter()
                   .append("g");

  ctbLabel.append("text")
          .attr("class", "axisLabel")
          .attr("x", d => d.contribution < 0
                          ? x(d.barStart) - 5 : x(d.barSupport) + 5)
          .attr("y", d => y(d.variable) + y.bandwidth()/2)
          .attr("dy", "0.4em")
          .attr("text-anchor", d => d.sign == "-1" ? "end" : "start")
          .transition()
          .duration(TIME)
          .delay((d,i) => (i+1) * TIME)
          .text(d => d.sign === "-1" ? d.contribution : "+"+d.contribution);

  // add lines to bars
  var lines = SV.selectAll()
                .data(bData)
                .enter()
                .append("g");

  lines.append("line")
        .attr("class", "interceptLine")
        .attr("x1", d => d.contribution < 0 ? x(d.barSupport) : x(d.barStart))
        .attr("y1", d => y(d.variable))
        .attr("x2", d => d.contribution < 0 ? x(d.barSupport) : x(d.barStart))
        .attr("y2", d => y(d.variable))
        .transition()
        .duration(TIME)
        .delay((d,i) => (i+1) * TIME)
        .attr("y2", (d,i) => i == svBarCount - 1
                             ? y(d.variable) + y.bandwidth()
                             : y(d.variable) + y.bandwidth()*2.5);



  var description = SV.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + svPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function ceterisParibus() {

  let tObservationId = CLICKED_OBSERVATION_ID,
      tData = obsData[tObservationId];

  let cpData = tData[1],
      profData = cpData.x,
      xMinMax = cpData.x_min_max_list,
      yMinMax = cpData.y_min_max,
      pData = cpData.observation,
      isNumeric = cpData.is_numeric
      desc = cpData.desc;

  let tVariableName = CLICKED_VARIABLE_NAME;

  // lines or bars?
  if (isNumeric[tVariableName][0]) {
    cpNumericalPlot(tVariableName, profData[tVariableName],
                    xMinMax[tVariableName], yMinMax, pData,
                    desc[tVariableName]);
  } else {
    cpCategoricalPlot(tVariableName, profData[tVariableName],
                      yMinMax, pData, desc[tVariableName]);
  }
}

function featureImportance() {

  var fiBarCount = fiData.m[0],
      bData = fiData.x,
      xMinMax = fiData.x_min_max,
      desc = fiData.desc;

  var fiPlotHeight = SCALE_PLOT ? h : fiBarCount*fiBarWidth + (fiBarCount+1)*fiBarWidth/2,
      fiPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left, margin.left + fiPlotWidth])
            .domain([xMinMax[0], xMinMax[1]]);

  FI.append("text")
    .attr("transform",
          "translate(" + (margin.left + fiPlotWidth/2) + " ," +
                         (margin.top + fiPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text("drop-out loss");

  var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickSize(0);

  xAxis = FI.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0," + (margin.top + fiPlotHeight) + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove());

  var y = d3.scaleBand()
            .rangeRound([margin.top + fiPlotHeight, margin.top - additionalHeight])
            .padding(0.33)
            .domain(bData.map(d => d.variable));

  var xGrid = FI.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + (margin.top + fiPlotHeight) + ")")
                .call(d3.axisBottom(x)
                        .ticks(10)
                        .tickSize(-fiPlotHeight - additionalHeight)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yGrid = FI.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .tickSize(-fiPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .tickSize(0);

  yAxis = FI.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + (margin.left - 10) + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  yAxis.selectAll("text").call(wrapText, margin.left - 15);

  FI.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 15)
    .attr("class", "smallTitle")
    .text(fiSubtitle);

  FI.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .attr("class", "bigTitle")
    .text(fiTitle);

  // tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipFI")
                  .html(d => d.type === "desc"
                             ? descTooltipHtml(d)
                             : fiStaticTooltipHtml(d, modelName));
  FI.call(tooltip);

  // bars
  var bars = FI.selectAll()
               .data(bData)
               .enter()
               .append("g");

  // find full model dropout_loss value
  var fullModel = bData[0].full_model;

  bars.append("rect")
      .attr("class", modelName.replace(/\s/g,''))
      .attr("fill", fiBarColor)
      .attr("x", d => x(fullModel))
      .attr("y", d => y(d.variable))
      .attr("height", y.bandwidth())
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide)
      .attr("id", (d) => d.variable)
      .on("click", function(){
        updatePlots(event = "variableChange",
                    variableName = this.id,
                    observationId = null,
                    plotId = null);
      })
      .transition()
      .duration(TIME)
      .delay((d,i) => i * TIME)
      .attr("x", d => x(d.dropout_loss) < x(fullModel)
                      ? x(d.dropout_loss) : x(fullModel))
      .attr("width", d => Math.abs(x(d.dropout_loss) - x(fullModel)));

  // make line next to bars
  var minimumY = Number.MAX_VALUE;
  var maximumY = Number.MIN_VALUE;
  bars.selectAll(".".concat(modelName.replace(/\s/g,''))).each(function() {
    if (+this.getAttribute('y') < minimumY) {
      minimumY = +this.getAttribute('y');
    }
    if (+this.getAttribute('y') > maximumY) {
      maximumY = +this.getAttribute('y');
    }
  });

  FI.append("line")
    .attr("class", "interceptLine")
    .attr("x1", x(fullModel))
    .attr("y1", minimumY)
    .attr("x2", x(fullModel))
    .attr("y2", maximumY + y.bandwidth());

  var description = FI.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + fiPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function partialDependency() {

  let profData = pdData.x,
      xMinMax = pdData.x_min_max_list,
      yMinMax = pdData.y_min_max,
      yMean = pdData.y_mean,
      isNumeric = pdData.is_numeric,
      desc = pdData.desc;

  let tVariableName = CLICKED_VARIABLE_NAME;

  // lines or bars?
  if (isNumeric[tVariableName][0]) {
    pdNumericalPlot(tVariableName, profData[tVariableName],
                    xMinMax[tVariableName], yMinMax, yMean,
                    desc[tVariableName]);
  } else {
    pdCategoricalPlot(tVariableName, profData[tVariableName],
                      yMinMax, yMean, desc[tVariableName]);
  }
}

function accumulatedDependency() {

  let profData = adData.x,
      xMinMax = adData.x_min_max_list,
      yMinMax = adData.y_min_max,
      yMean = adData.y_mean,
      isNumeric = adData.is_numeric,
      desc = adData.desc;

  let tVariableName = CLICKED_VARIABLE_NAME;

  // lines or bars?
  if (isNumeric[tVariableName][0]) {
    adNumericalPlot(tVariableName, profData[tVariableName],
                    xMinMax[tVariableName], yMinMax, yMean,
                    desc[tVariableName]);
  } else {
    adCategoricalPlot(tVariableName, profData[tVariableName],
                      yMinMax, yMean, desc[tVariableName]);
  }
}

function featureDistribution() {

  let dData = fdData.x,
      xMinMax = fdData.x_min_max_list,
      xMax = fdData.x_max_list,
      nBin = fdData.nbin,
      isNumeric = fdData.is_numeric;

  let tVariableName = CLICKED_VARIABLE_NAME;

  // histogram or bars?
  if (isNumeric[tVariableName][0]) {
    fdNumericalPlot(tVariableName, dData, xMinMax[tVariableName],
                    nBin[tVariableName]);
  } else {
    fdCategoricalPlot(tVariableName, dData, xMax[tVariableName]);
  }
}

/// small plot functions

function cpNumericalPlot(variableName, lData, mData, yMinMax, pData, desc) {

  var cpPlotHeight = h,
      cpPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left + 10, margin.left + cpPlotWidth - 10])
            .domain([mData[0], mData[1]]);

  CP.append("text")
    .attr("transform",
          "translate(" + (margin.left + cpPlotWidth/2) + " ," +
                         (margin.top + cpPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text(variableName + " = " + pData[0][variableName]);

  var y = d3.scaleLinear()
            .range([margin.top + cpPlotHeight, margin.top - additionalHeight])
            .domain([yMinMax[0], yMinMax[1]]);

  var line = d3.line()
               .x(d => x(d.xhat))
               .y(d => y(d.yhat))
               .curve(d3.curveMonotoneX);

   CP.append("text")
     .attr("class","smallTitle")
     .attr("x", margin.left)
     .attr("y", margin.top - 15)
     .text(cpSubtitle); //variableName + " = " + pData[0][variableName]

  CP.append("text")
    .attr("class", "bigTitle")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .text(cpTitle);

  // find 5 nice ticks with max and min - do better than d3
  var tickValues = getTickValues(x.domain());

  var xAxis = d3.axisBottom(x)
                .tickValues(tickValues)
                .tickSizeInner(0)
                .tickPadding(15);

  xAxis = CP.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0,"+ (margin.top + cpPlotHeight) + ")")
            .call(xAxis);

  var yGrid = CP.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .ticks(10)
                        .tickSize(-cpPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .ticks(5)
                .tickSize(0);

  yAxis = CP.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + margin.left + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  // make tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipCP")
                  .html((d, addData) => {

                    if (d.type === "desc") {
                      return descTooltipHtml(d)
                    } else if (addData !== undefined) {
                      return cpChangedTooltipHtml(d, addData);
                    } else {
                        return cpStaticTooltipHtml(d);
                    }
                   });
  CP.call(tooltip);

  // function to find nearest point on the line
  var bisectXhat = d3.bisector(d => d.xhat).right;

  // show tooltip with info nearest to mouseover
  function showTooltip(hover) {
    var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
        i = bisectXhat(hover, x0),
        d0 = hover[i - 1],
        d1 = hover[i],
        d = x0 - d0.xhat > d1.xhat - x0 ? d1 : d0;
    let temp = pData.find(el => el["observation.id"] === d.id);
    tooltip.show(d, temp);
  }

  // add path
  var p = CP.append("path")
            .attr("class", "line " + variableName)
            .style("fill", "none")
            .style("stroke", cpLineColor)
            .style("stroke-width", cpLineSize)
            .on('mouseover', function(d) {

              // make mouseover line more visible
              d3.select(this)
                .style("stroke", defaultColor)
                .style("stroke-width", cpLineSize*1.5);

              // make line and points appear on top
              this.parentNode.appendChild(this);
              d3.select(this.parentNode).selectAll(".point").each(function() {
                               this.parentNode.appendChild(this);
                          });

              // show changed tooltip
              showTooltip(d);
            })
            .on('mouseout', function(d) {

              d3.select(this)
                .style("stroke", cpLineColor)
                .style("stroke-width", cpLineSize);

              // hide changed tooltip
              tooltip.hide(d);
            });

  // animate path
  p.data([{"xhat":0, "yhat": 0}])
   .attr("d", line)
   .transition()
   .duration(TIME)
   .attrTween("d", function() {
     var previous = d3.select(this).attr('d');
     var current = line(lData);
     return d3.interpolatePath(previous, current);
   });

  // add data for tooltip
  p.data([lData]);

  // add points
  CP.selectAll()
    .data(pData)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("id", d => d["observation.id"])
    .attr("cx", d => x(d[variableName]))
    .attr("cy", d => y(d.yhat))
    .attr("r", 0)
    .style("stroke-width", 15)
    .style("stroke", "red")
    .style("stroke-opacity", 0)
    .style("fill", cpPointColor)
    .on('mouseover', function(d) {
      tooltip.show(d);
  		d3.select(this)
  			.attr("r", 2*cpPointSize);
  	})
    .on('mouseout', function(d) {
      tooltip.hide(d);
  		d3.select(this)
  			.attr("r", cpPointSize);
  	})
    .transition()
    .duration(TIME)
    .delay(TIME)
    .attr("r", cpPointSize);

  // add rugs
  CP.selectAll()
    .data(pData)
    .enter()
    .append("line")
    .attr("class", "rugLine")
    .style("stroke", "red")
    .style("stroke-width", 2)
    .attr("x1", d => x(d[variableName]))
    .attr("y1", margin.top + cpPlotHeight)
    .attr("x2", d => x(d[variableName]))
    .attr("y2", margin.top + cpPlotHeight - 10);

  CP.append("text")
    .attr("class", "axisTitle")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left-40)
    .attr("x", -(margin.top + cpPlotHeight/2))
    .attr("text-anchor", "middle")
    .text("prediction");

  var description = CP.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + cpPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function cpCategoricalPlot(variableName, bData, yMinMax, lData, desc) {

  var cpBarCount = bData.map(d => d.xhat).length;

  var cpPlotHeight = SCALE_PLOT ? h : cpBarCount*cpBarWidth + (cpBarCount+1)*cpBarWidth/2,
      cpPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left,  margin.left + cpPlotWidth])
            .domain([yMinMax[0], yMinMax[1]]); // because it is flipped

  var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickSize(0);

  xAxis = CP.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0," + (margin.top + cpPlotHeight) + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove());

  var y = d3.scaleBand()
            .rangeRound([margin.top - additionalHeight, margin.top + cpPlotHeight])
            .padding(0.33)
            .domain(bData.map(d => d.xhat));

  var xGrid = CP.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + (margin.top + cpPlotHeight) + ")")
                .call(d3.axisBottom(x)
                        .ticks(10)
                        .tickSize(-cpPlotHeight - additionalHeight)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yGrid = CP.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .tickSize(-cpPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .tickSize(0);

  yAxis = CP.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + (margin.left - 10) + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  yAxis.selectAll("text").call(wrapText, margin.left - 15);

  CP.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 15)
    .attr("class", "smallTitle")
    .text(cpSubtitle); //variableName + " = " + lData[0][variableName]

  CP.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .attr("class", "bigTitle")
    .text(cpTitle);

  var bars = CP.selectAll()
               .data(bData)
               .enter()
               .append("g");

  var fullModel = lData[0].yhat;

  // make tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipCP")
                  .html(d => d.type === "desc" ?
                   descTooltipHtml(d) : cpChangedTooltipHtml(d, lData[0]));
  CP.call(tooltip);

  // add bars
  bars.append("rect")
      .attr("class", variableName)
      .attr("fill", cpBarColor)
      .attr("x", d => x(fullModel))
      .attr("y", d => y(d.xhat))
      .attr("height", y.bandwidth())
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide)
      .transition()
      .duration(TIME)
      .delay((d,i) => i * TIME)
      .attr("x", d => x(d.yhat) < x(fullModel) ? x(d.yhat) : x(fullModel))
      .attr("width", d => Math.abs(x(d.yhat) - x(fullModel)));

  // add intercept line
  var minimumY = Number.MAX_VALUE;
  var maximumY = Number.MIN_VALUE;

  bars.selectAll(".".concat(variableName)).each(function() {
      if (+this.getAttribute('y') < minimumY) {
        minimumY = +this.getAttribute('y');
      }
      if (+this.getAttribute('y') > maximumY) {
        maximumY = +this.getAttribute('y');
      }
    });

  CP.append("line")
    .attr("class", "interceptLine")
    .attr("x1", x(fullModel))
    .attr("y1", minimumY)
    .attr("x2", x(fullModel))
    .attr("y2", maximumY + y.bandwidth());

  CP.append("text")
    .attr("transform",
          "translate(" + (margin.left + cpPlotWidth/2) + " ," +
                         (margin.top + cpPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text("prediction");

  var description = CP.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + cpPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function pdNumericalPlot(variableName, lData, mData, yMinMax, yMean, desc) {

  var pdPlotHeight = h,
      pdPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left + 10, margin.left + pdPlotWidth - 10])
            .domain([mData[0], mData[1]]);

  PD.append("text")
    .attr("transform",
          "translate(" + (margin.left + pdPlotWidth/2) + " ," +
                         (margin.top + pdPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text(variableName);

  var y = d3.scaleLinear()
            .range([margin.top + pdPlotHeight, margin.top - additionalHeight])
            .domain([yMinMax[0], yMinMax[1]]);

  var line = d3.line()
               .x(d => x(d.xhat))
               .y(d => y(d.yhat))
               .curve(d3.curveMonotoneX);

   PD.append("text")
     .attr("class","smallTitle")
     .attr("x", margin.left)
     .attr("y", margin.top - 15)
     .text(pdSubtitle); // variableName

  PD.append("text")
    .attr("class", "bigTitle")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .text(pdTitle);

  // find 5 nice ticks with max and min - do better than d3
  var tickValues = getTickValues(x.domain());

  var xAxis = d3.axisBottom(x)
                .tickValues(tickValues)
                .tickSizeInner(0)
                .tickPadding(15);

  xAxis = PD.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0,"+ (margin.top + pdPlotHeight) + ")")
            .call(xAxis);

  var yGrid = PD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .ticks(10)
                        .tickSize(-pdPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .ticks(5)
                .tickSize(0);

  yAxis = PD.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + margin.left + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  // make tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipPD")
                  .html(d => d.type === "desc" ?
                   descTooltipHtml(d) : pdStaticTooltipHtml(d, variableName, yMean));
  PD.call(tooltip);

  // function to find nearest point on the line
  var bisectXhat = d3.bisector(d => d.xhat).right;

  // show tooltip with info nearest to mouseover
  function showTooltip(hover){
    var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
        i = bisectXhat(hover, x0),
        d0 = hover[i - 1],
        d1 = hover[i],
        d = x0 - d0.xhat > d1.xhat - x0 ? d1 : d0;

    tooltip.show(d);
  }

  // add lines
  var p = PD.append("path")
            .attr("class", "line " + variableName)
            .style("fill", "none")
            .style("stroke", pdLineColor)
            .style("stroke-width", pdLineSize)
            .on('mouseover', function(d){

              // make mouseover line more visible
              d3.select(this)
                .style("stroke", defaultColor)
                .style("stroke-width", pdLineSize*1.5);

              // make line appear on top
              this.parentNode.appendChild(this);

              // show changed tooltip
              showTooltip(d);
            })
            .on('mouseout', function(d){

              d3.select(this)
                .style("stroke", pdLineColor)
                .style("stroke-width", pdLineSize);

              // hide changed tooltip
              tooltip.hide(d);
            });

  // animate path
  p.data([{"xhat":0, "yhat": 0}])
   .attr("d", line)
   .transition()
   .duration(TIME)
   .attrTween("d", function() {
     var previous = d3.select(this).attr('d');
     var current = line(lData);
     return d3.interpolatePath(previous, current);
   });

  // add data for tooltip
  p.data([lData]);

  PD.append("text")
    .attr("class", "axisTitle")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left-40)
    .attr("x", -(margin.top + pdPlotHeight/2))
    .attr("text-anchor", "middle")
    .text("average prediction");

  var description = PD.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + pdPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function pdCategoricalPlot(variableName, bData, yMinMax, yMean, desc) {

  var pdBarCount = bData.map(d => d.xhat).length;

  var pdPlotHeight = SCALE_PLOT ? h : pdBarCount*pdBarWidth + (pdBarCount+1)*pdBarWidth/2,
      pdPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left,  margin.left + pdPlotWidth])
            .domain([yMinMax[0], yMinMax[1]]); // because it is flipped

  var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickSize(0);

  xAxis = PD.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0," + (margin.top + pdPlotHeight) + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove());

  var y = d3.scaleBand()
            .rangeRound([margin.top - additionalHeight, margin.top + pdPlotHeight])
            .padding(0.33)
            .domain(bData.map(d => d.xhat));

  var xGrid = PD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + (margin.top + pdPlotHeight) + ")")
                .call(d3.axisBottom(x)
                        .ticks(10)
                        .tickSize(-pdPlotHeight - additionalHeight)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yGrid = PD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .tickSize(-pdPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .tickSize(0);

  yAxis = PD.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + (margin.left - 8) + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  yAxis.selectAll("text").call(wrapText, margin.left - 15);

  PD.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 15)
    .attr("class", "smallTitle")
    .text(pdSubtitle); // variableName

  PD.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .attr("class", "bigTitle")
    .text(pdTitle);

  var bars = PD.selectAll()
               .data(bData)
               .enter()
               .append("g");

  var fullModel = yMean;

  // make tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipPD")
                  .html(d => d.type === "desc" ?
                   descTooltipHtml(d) : pdStaticTooltipHtml(d, variableName, yMean));
  PD.call(tooltip);

  // add bars
  bars.append("rect")
      .attr("class", variableName)
      .attr("fill", pdBarColor)
      .attr("x", d => x(fullModel))
      .attr("y", d => y(d.xhat))
      .attr("height", y.bandwidth())
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide)
      .transition()
      .duration(TIME)
      .delay((d,i) => i * TIME)
      .attr("x", d => x(d.yhat) < x(fullModel) ? x(d.yhat) : x(fullModel))
      .attr("width", d => Math.abs(x(d.yhat) - x(fullModel)));

  // add intercept line
  var minimumY = Number.MAX_VALUE;
  var maximumY = Number.MIN_VALUE;

  bars.selectAll(".".concat(variableName)).each(function() {
      if (+this.getAttribute('y') < minimumY) {
        minimumY = +this.getAttribute('y');
      }
      if (+this.getAttribute('y') > maximumY) {
        maximumY = +this.getAttribute('y');
      }
    });

  PD.append("line")
    .attr("class", "interceptLine")
    .attr("x1", x(fullModel))
    .attr("y1", minimumY)
    .attr("x2", x(fullModel))
    .attr("y2", maximumY + y.bandwidth());

  PD.append("text")
    .attr("transform",
          "translate(" + (margin.left + pdPlotWidth/2) + "," +
                         (margin.top + pdPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text("average prediction");

  var description = PD.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + pdPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function adNumericalPlot(variableName, lData, mData, yMinMax, yMean, desc) {

  var adPlotHeight = h,
      adPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left + 10, margin.left + adPlotWidth - 10])
            .domain([mData[0], mData[1]]);

  AD.append("text")
    .attr("transform",
          "translate(" + (margin.left + adPlotWidth/2) + " ," +
                         (margin.top + adPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text(variableName);

  var y = d3.scaleLinear()
            .range([margin.top + adPlotHeight, margin.top - additionalHeight])
            .domain([yMinMax[0], yMinMax[1]]);

  var line = d3.line()
               .x(d => x(d.xhat))
               .y(d => y(d.yhat))
               .curve(d3.curveMonotoneX);

   AD.append("text")
     .attr("class","smallTitle")
     .attr("x", margin.left)
     .attr("y", margin.top - 15)
     .text(adSubtitle); // variableName

  AD.append("text")
    .attr("class", "bigTitle")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .text(adTitle);

  // find 5 nice ticks with max and min - do better than d3
  var tickValues = getTickValues(x.domain());

  var xAxis = d3.axisBottom(x)
                .tickValues(tickValues)
                .tickSizeInner(0)
                .tickPadding(15);

  xAxis = AD.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0,"+ (margin.top + adPlotHeight) + ")")
            .call(xAxis);

  var yGrid = AD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .ticks(10)
                        .tickSize(-adPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .ticks(5)
                .tickSize(0);

  yAxis = AD.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + margin.left + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  // make tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipPD")
                  .html(d => d.type === "desc" ?
                   descTooltipHtml(d) : adStaticTooltipHtml(d, variableName, yMean));
  AD.call(tooltip);

  // function to find nearest point on the line
  var bisectXhat = d3.bisector(d => d.xhat).right;

  // show tooltip with info nearest to mouseover
  function showTooltip(hover){
    var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
        i = bisectXhat(hover, x0),
        d0 = hover[i - 1],
        d1 = hover[i],
        d = x0 - d0.xhat > d1.xhat - x0 ? d1 : d0;

    tooltip.show(d);
  }

  // add lines
  var p = AD.append("path")
            .attr("class", "line " + variableName)
            .style("fill", "none")
            .style("stroke", adLineColor)
            .style("stroke-width", adLineSize)
            .on('mouseover', function(d){

              // make mouseover line more visible
              d3.select(this)
                .style("stroke", defaultColor)
                .style("stroke-width", adLineSize*1.5);

              // make line appear on top
              this.parentNode.appendChild(this);

              // show changed tooltip
              showTooltip(d);
            })
            .on('mouseout', function(d){

              d3.select(this)
                .style("stroke", adLineColor)
                .style("stroke-width", adLineSize);

              // hide changed tooltip
              tooltip.hide(d);
            });

  // animate path
  p.data([{"xhat":0, "yhat": 0}])
   .attr("d", line)
   .transition()
   .duration(TIME)
   .attrTween("d", function() {
     var previous = d3.select(this).attr('d');
     var current = line(lData);
     return d3.interpolatePath(previous, current);
   });

  // add data for tooltip
  p.data([lData]);

  AD.append("text")
    .attr("class", "axisTitle")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left-40)
    .attr("x", -(margin.top + adPlotHeight/2))
    .attr("text-anchor", "middle")
    .text("accumulated prediction");

  var description = AD.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + adPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function adCategoricalPlot(variableName, bData, yMinMax, yMean, desc) {

  var adBarCount = bData.map(d => d.xhat).length;

  var adPlotHeight = SCALE_PLOT ? h : adBarCount*adBarWidth + (adBarCount+1)*adBarWidth/2,
      adPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left,  margin.left + adPlotWidth])
            .domain([yMinMax[0], yMinMax[1]]); // because it is flipped

  var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickSize(0);

  xAxis = AD.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0," + (margin.top + adPlotHeight) + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove());

  var y = d3.scaleBand()
            .rangeRound([margin.top - additionalHeight, margin.top + adPlotHeight])
            .padding(0.33)
            .domain(bData.map(d => d.xhat));

  var xGrid = AD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + (margin.top + adPlotHeight) + ")")
                .call(d3.axisBottom(x)
                        .ticks(10)
                        .tickSize(-adPlotHeight - additionalHeight)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yGrid = AD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .tickSize(-adPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .tickSize(0);

  yAxis = AD.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + (margin.left - 10) + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  yAxis.selectAll("text").call(wrapText, margin.left - 15);

  AD.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 15)
    .attr("class", "smallTitle")
    .text(adSubtitle); // variableName

  AD.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .attr("class", "bigTitle")
    .text(adTitle);

  var bars = AD.selectAll()
               .data(bData)
               .enter()
               .append("g");

  var fullModel = 0; //yMean;

  // make tooltip
  var tooltip = d3.tip()
                  .attr("class", "d3-tip")
                  .attr("id", "tooltipAD")
                  .html(d => d.type === "desc" ?
                   descTooltipHtml(d) : adStaticTooltipHtml(d, variableName, yMean));
  AD.call(tooltip);

  // add bars
  bars.append("rect")
      .attr("class", variableName)
      .attr("fill", adBarColor)
      .attr("x", d => x(fullModel))
      .attr("y", d => y(d.xhat))
      .attr("height", y.bandwidth())
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide)
      .transition()
      .duration(TIME)
      .delay((d,i) => i * TIME)
      .attr("x", d => x(d.yhat) < x(fullModel) ? x(d.yhat) : x(fullModel))
      .attr("width", d => Math.abs(x(d.yhat) - x(fullModel)));;

  // add intercept line
  var minimumY = Number.MAX_VALUE;
  var maximumY = Number.MIN_VALUE;

  bars.selectAll(".".concat(variableName)).each(function() {
      if (+this.getAttribute('y') < minimumY) {
        minimumY = +this.getAttribute('y');
      }
      if (+this.getAttribute('y') > maximumY) {
        maximumY = +this.getAttribute('y');
      }
    });

  AD.append("line")
    .attr("class", "interceptLine")
    .attr("x1", x(fullModel))
    .attr("y1", minimumY)
    .attr("x2", x(fullModel))
    .attr("y2", maximumY + y.bandwidth());

  AD.append("text")
    .attr("transform",
          "translate(" + (margin.left + adPlotWidth/2) + "," +
                         (margin.top + adPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text("accumulated prediction");

  var description = AD.append("g")
                      .attr("transform", "translate(" +
                            (margin.left + adPlotWidth - 4*margin.big - margin.small)
                            + "," + (-margin.big) + ")");

  description.selectAll()
             .data(desc)
             .enter()
             .append("rect")
             .attr("class", "descriptionBox")
             .attr("width", 2*margin.big)
             .attr("height", 2*margin.big)
             .attr("rx", 2*margin.big)
             .attr("ry", 2*margin.big)
             .on('mouseover', tooltip.show)
             .on('mouseout', tooltip.hide);

  description.selectAll()
             .data(desc)
             .enter()
             .append("text")
             .attr("class", "descriptionLabel")
             .attr("x", 6)
             .attr("dy", "1.05em")
             .text("D")
             .on('mouseover', function(d) {
               tooltip.show(d);
               d3.select(this).style("cursor", "default");
             })
             .on('mouseout', tooltip.hide);
}

function fdNumericalPlot(variableName, dData, mData, nBin) {

  var fdPlotHeight = h,
      fdPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left + 10, margin.left + fdPlotWidth - 10])
            .domain([mData[0], mData[1]]);

  FD.append("text")
    .attr("transform",
          "translate(" + (margin.left + fdPlotWidth/2) + " ," +
                         (margin.top + fdPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text(variableName);

  FD.append("text")
    .attr("class", "axisTitle")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left-40)
    .attr("x", -(margin.top + fdPlotHeight/2))
    .attr("text-anchor", "middle")
    .text("count");

  var y = d3.scaleLinear()
        .range([margin.top + fdPlotHeight - 5, margin.top]);

  FD.append("text")
    .attr("class","smallTitle")
    .attr("x", margin.left)
    .attr("y", margin.top - 15)
    .text(fdSubtitle);

  FD.append("text")
    .attr("class", "bigTitle")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .text(fdTitle);

  // find 5 nice ticks with max and min - do better than d3
  var tickValues = getTickValues(x.domain());

  var xAxis = d3.axisBottom(x)
                .tickValues(tickValues)
                .tickSizeInner(0)
                .tickPadding(15);

  xAxis = FD.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0,"+ (margin.top + fdPlotHeight) + ")")
            .call(xAxis);

  var yAxis = FD.append("g")
                .attr("class", "axisLabel")
                .attr("transform", "translate(" + margin.left + ",0)");

  var yGrid = FD.append("g")
                  .attr("class", "grid")
                  .attr("transform", "translate(" + margin.left + ",0)");

  var slider = d3.sliderBottom()
                 .min(d3.max([+nBin-10,2]))
                 .max(d3.max([+nBin+10,12]))
                 .width(fdPlotWidth/2 - 40) // fit exit button
                 .ticks(8)
                 .step(1)
                 .default(nBin)
                 .fill(fdBarColor)
                 .on('onchange', val => updateHist(val));

  var sliderg = FD.append("g").call(slider);

  sliderg.attr("transform", "translate(" + (margin.left + fdPlotWidth/2 - margin.small)
                            + "," + margin.small + ")");

  updateHist(nBin);

  function updateHist(nbin) {

    var histogram = d3.histogram()
                      .value(d => d[variableName])
                      .domain(x.domain())
                      .thresholds(x.ticks(nbin));

    var bins = histogram(dData);

    y.domain([0, d3.max(bins, d => d.length)]);

    let yaF = d3.axisLeft(y)
                .ticks(5)
                .tickSize(0);

    yAxis.call(yaF)
         .call(g => g.select(".domain").remove());

    yGrid.call(d3.axisLeft(y)
                 .ticks(10)
                 .tickSize(-fdPlotWidth)
                 .tickFormat("")
               ).call(g => g.select(".domain").remove());

    var bars = FD.selectAll("rect")
                 .data(bins);

    bars.enter()
        .append("rect")
        .attr("fill", fdBarColor)
        .merge(bars)
        .attr("x", d => x(d.x0))
        .attr("y", d => y(0))
        .attr("height", d => 0)
        .attr("width", d => x(d.x1) - x(d.x0))
        .transition()
        .duration(TIME)
          .attr("y", d => y(d.length))
          .attr("height", d => y(0) - y(d.length));

    bars.exit()
        .remove()
  }
}

function fdCategoricalPlot(variableName, dData, mData) {

  // equivalent of R table function
  var tableData = d3.nest()
                    .key(d => d[variableName])
                    .rollup(v => v.length)
                    .entries(dData);

  var fdBarCount = tableData.map(d => d.key).length;

  var fdPlotHeight = SCALE_PLOT ? h : fdBarCount*fdBarWidth + (fdBarCount+1)*fdBarWidth/2,
      fdPlotWidth = w;

  var x = d3.scaleLinear()
            .range([margin.left, margin.left + fdPlotWidth])
            .domain([0, mData]);

  var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickSize(0);

  xAxis = FD.append("g")
            .attr("class", "axisLabel")
            .attr("transform", "translate(0," + (margin.top + fdPlotHeight) + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove());

  var y = d3.scaleBand()
            .rangeRound([margin.top - additionalHeight, margin.top + fdPlotHeight])
            .padding(0.33)
            .domain(tableData.map(d => d.key));

  var xGrid = FD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + (margin.top + fdPlotHeight) + ")")
                .call(d3.axisBottom(x)
                        .ticks(10)
                        .tickSize(-fdPlotHeight - additionalHeight)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yGrid = FD.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + margin.left + ",0)")
                .call(d3.axisLeft(y)
                        .tickSize(-fdPlotWidth)
                        .tickFormat("")
                ).call(g => g.select(".domain").remove());

  var yAxis = d3.axisLeft(y)
                .tickSize(0);

  yAxis = FD.append("g")
            .attr("class", "axisLabel")
            .attr("transform","translate(" + (margin.left - 10) + ",0)")
            .call(yAxis)
            .call(g => g.select(".domain").remove());

  yAxis.selectAll("text").call(wrapText, margin.left - 15);

  FD.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 15)
    .attr("class", "smallTitle")
    .text(fdSubtitle);

  FD.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top - 40)
    .attr("class", "bigTitle")
    .text(fdTitle);

  var bars = FD.selectAll()
               .data(tableData)
               .enter()
               .append("g");

  // add bars
  bars.append("rect")
      .attr("class", variableName)
      .attr("fill", fdBarColor)
      .attr("x", d => x(0))
      .attr("y", d => y(d.key))
      .attr("height", y.bandwidth())
      .transition()
      .duration(TIME)
      .delay((d,i) => i * TIME)
      .attr("width", d => x(d.value)-x(0));

  // add intercept line
  var minimumY = Number.MAX_VALUE;
  var maximumY = Number.MIN_VALUE;

  bars.selectAll(".".concat(variableName)).each(function() {
      if (+this.getAttribute('y') < minimumY) {
        minimumY = +this.getAttribute('y');
      }
      if (+this.getAttribute('y') > maximumY) {
        maximumY = +this.getAttribute('y');
      }
    });

  FD.append("line")
    .attr("class", "interceptLine")
    .attr("x1", x(0))
    .attr("y1", minimumY)
    .attr("x2", x(0))
    .attr("y2", maximumY + y.bandwidth());

  FD.append("text")
    .attr("transform",
          "translate(" + (margin.left + fdPlotWidth/2) + "," +
                         (margin.top + fdPlotHeight + 45) + ")")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .text("count");
}

/// event plot functions

function updatePlots(event, variableName, observationId, plotId) {
  /// main plot controller, not used arguments are passed as null

  switch (event) {
    case "observationChange":
      CLICKED_OBSERVATION_ID = observationId;
      removePlots(["BD", "SV", "CP"]);
      generatePlots(["BD", "SV", "CP"]);
      break;

    case "variableChange":
      // safeguard
      if (variableName == "prediction" || variableName == "intercept" ||
          variableName == "other") { return; }
      CLICKED_VARIABLE_NAME = variableName;
      removePlots(["CP", "PD", "AD", "FD"]);
      generatePlots(["CP", "PD", "AD", "FD"]);
      break;

    case "chosePlot":
      removePlots([plotId]);
      generatePlots([plotId]);
      break;

    default:
      console.log("Unknown event in updatePlots " +
                  [event,variableName,observationId,plotId]);
      break;
  }
}

function removePlots(arrPlotId) {
  /// check if there is something to delete and get rid of it (with tooltip)
  arrPlotId.forEach((id) => {
    if (!svg.select("#"+id).selectAll("*").empty()) {
      svg.select("#"+id).selectAll("*").remove();
      d3.select("body").select("#tooltip"+id).remove();
    }
  })
}

function generatePlots(arrPlotId) {
  /// check if the plot got removed and make new one
  arrPlotId.forEach((id) => {
    if (svg.select("#"+id).selectAll("*").empty()) {
      // execute plot function
      mapIdPlotFunction[id]();
    }
  })
}
