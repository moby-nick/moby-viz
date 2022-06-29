
const margin = {
    top: 60,
    right: 30,
    bottom: 30,
    left: 80
  },
  width = 700 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
  //.attr("width", width + margin.left + margin.right)
  //.attr("height", height + margin.top + margin.bottom)
  .attr("viewBox", [0, 0, width * (1.25), height * 1.25])
        .style("display", "block")
      //.style("margin", "0 -14px")
  .style("background", "#1b1e23")
  .style("color", "#fff")


const gDrawing = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//Read the data
d3.csv("https://storage.googleapis.com/storage/v1/b/momentum-table-current/o/long_form2.csv?alt=media").then(
  function(data) {
    var allGroup = Array.from(d3.rollup(data, (v) => v.length, (d) => d.symbol_name).keys()).sort(d3.ascending);
    // add the options to the button
    d3
	.select("#selectButton")
	.attr("size", 5)
	.style("padding", "12px 20px")
	.style("width", "100%")
	.style("font-size", "1em")
	.style("background", "black")
	.style("color", "white").style("border", "0px");


    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(allGroup)
      .enter()
      .append('option')
      .text(function(d) {
        return d;
      }) // text shown in the menu
	  .style("font-size", "2em")
      .attr("value", function(d) {
        return d; // corresponding value returned by the button
      }).property("selected", function(d) {
        return d === "Apple (AAPL)";
      })



    var initialData = data.filter((d) => d["symbol"] === "AAPL");
    //console.log(initialData);
    var times = d3.map(initialData, (d) => d3.timeParse("%Y-%m-%d")(d.date));

    // Add X axis --> it is a date format
    const x = d3.scaleTime()
      .domain(d3.extent(times))
      .range([0, width]);

    gDrawing.append("g")
		.style("font-size", "1em")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
    gDrawing.append("g")
	.style("font-size", "1em")
      .call(d3.axisLeft(y).ticks(3).tickSizeOuter(0));

    // using the Moby color palette
    const color = d3.scaleOrdinal()
      .range(["#89ea3c", "#bacfe7", "#fa4441"])

   // Title
   gDrawing.append("text")
    .attr("x", width / 2 )
    .attr("y", 0 - margin.top / 2)
    .style("text-anchor", "middle")
	.style("fill", "white")
	.style("font-size", "2em")
    .text("Analyst Sentiment");

   // Y Axis Label
   gDrawing.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
	.style("fill", "white")
	.style("font-size", "1.75em")
    .text("Percent of Analysts");

    // Tooltips
    // create a tooltip
    // Three function that change the tooltip when user hover / move / leave a cell


    const line = gDrawing
      .selectAll(".line")
      .data(d3.group(data.filter(
        function(d) {
          return d.symbol_name == "Apple (AAPL)"
        }), (d) => d.sentiment))
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function(d) {
        return color(d[0]);
      })
      .attr("stroke-width", 8)
      .attr("d", function(d) {
        return d3.line()
          .x(function(d) {
            return x(d3.timeParse("%Y-%m-%d")(
              d.date));
          })
          .y(function(d) {
            return y(d.score * 100);
          })(d[1])
      })


    // A function that update the chart
    function update(selectedGroup) {
      // Create new data with the selection?
      var dataFilter = d3.group(data.filter(
        function(d) {
          return d.symbol_name === selectedGroup
        }), (d) => d.sentiment)
      console.log(dataFilter);

      // Give these new data to update line
      line
        .data(dataFilter)
        .transition()
        .duration(1000)
        .attr("d", function(d) {
          return d3.line()
            .x(function(d) {
              return x(d3.timeParse("%Y-%m-%d")(
                d.date));
            })
            .y(function(d) {
              return y(d.score * 100);
            })(d[1])

        })
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      update(selectedOption)
    })




  });
  // create the legend
  const legendHeight = height*1.25 - margin.bottom;
  const pos1 = (width + margin.left + margin.right)/5;
  const pos2 = ((width + margin.left + margin.right)/5)*2.5;
  const pos3 = ((width + margin.left + margin.right)/5)*4;
  svg.append("circle").attr("cx", pos1).attr("cy", legendHeight).attr("r", "0.75em").style("fill", "#89ea3c")
  svg.append("circle").attr("cx", pos2).attr("cy", legendHeight).attr("r", "0.75em").style("fill", "#bacfe7")
  svg.append("circle").attr("cx", pos3).attr("cy", legendHeight).attr("r", "0.75em").style("fill", "#fa4441")
  svg.append("text").attr("x", pos1 + 30).attr("y", legendHeight*1.01).text("Positive View").style("font-size", "1.25em").style("fill", "white").attr("alignment-baseline","middle")
  svg.append("text").attr("x", pos2 + 30).attr("y", legendHeight*1.01).text("Neutral View").style("font-size", "1.25em").style("fill", "white").attr("alignment-baseline","middle")
  svg.append("text").attr("x", pos3 + 30).attr("y", legendHeight*1.01).text("Negative View").style("font-size", "1.25em").style("fill", "white").attr("alignment-baseline","middle")


  //d3.select("#title_tag").attr()//.style("fon-size", "5em")
  d3.select("#target_table").style("border", "1px solid");
