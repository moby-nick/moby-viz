// set the dimensions and margins of the graph
var margin = {
    top: 10,
    right: 30,
    bottom: 30,
    left: 60
  },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
  //another comment

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("https://storage.googleapis.com/storage/v1/b/momentum-table-current/o/long_form.csv?alt=media").then(
  function(data) {
    var allGroup = Array.from(d3.rollup(data, (v) => v.length, (d) => d.symbol).keys()).sort(d3.ascending);
    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(allGroup)
      .enter()
      .append('option')
      .text(function(d) {
        return d;
      }) // text showed in the menu
      .attr("value", function(d) {
        return d;
      }) // corresponding value returned by the button

    var initialData = data.filter((d) => d["symbol"] === "AAPL");
    //console.log(initialData);
    var times = d3.map(initialData, (d) => d3.timeParse("%Y-%m-%d")(d.date));

    // Add X axis --> it is a date format
    const x = d3.scaleTime()
      .domain(d3.extent(times))
      .range([0, width]);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));


    // color palette
    const color = d3.scaleOrdinal()
      .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])

    const line = svg
      .selectAll(".line")
      .data(d3.group(data.filter(
        function(d) {
          return d.symbol == "AAPL"
        }), (d) => d.sentiment))
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function(d) {
        return color(d[0]);
      })
      .attr("stroke-width", 1.5)
      .attr("d", function(d) {
        return d3.line()
          .x(function(d) {
            return x(d3.timeParse("%Y-%m-%d")(
              d.date));
          })
          .y(function(d) {
            return y(d.score);
          })(d[1])
      })


    // A function that update the chart
    function update(selectedGroup) {
      // Create new data with the selection?
      var dataFilter = d3.group(data.filter(
        function(d) {
          return d.symbol === selectedGroup
        }), (d) => d.sentiment)
      console.log()

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
              return y(d.score);
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
