import * as d3 from "d3";

export function drawChartCapacity(
  data,
  chartRef,
  filterChart,
  legendColorCapacity,
  handleXAxisLabelClick,
  handleYAxisLabelClick,
  handleCapacityLegendClick,
  setTooltipX,
  setTooltipY
) {
  const parentWidth = chartRef.current.clientWidth;
  // Access the DOM element to draw the chart
  const svg = d3
    .select(chartRef.current)
    .append("svg")
    .attr("width", parentWidth)
    .attr("height", parentWidth > 500 ? parentWidth / 2.5 : 200)
    .on("mousemove", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svg.node());
      if (mouseX >= margin.left && mouseX <= width - margin.right) {
        const xValue = x.invert(mouseX);
        const yValue = getYValueAtX(xValue);
        setTooltipX(xValue.toFixed(0));
        setTooltipY(yValue.toFixed(6));
      }
    });

  function getYValueAtX(xValue) {
    const bisect = d3.bisector((d) => d.cycleNum).left;
    const index = bisect(data, xValue);
    let closestIndex;
    if (index === 0) {
      closestIndex = index;
    } else if (index >= data.length) {
      closestIndex = data.length - 1;
    } else {
      const leftDistance = Math.abs(data[index - 1].cycleNum - xValue);
      const rightDistance = Math.abs(data[index].cycleNum - xValue);
      closestIndex = leftDistance < rightDistance ? index - 1 : index;
    }

    // Return the y value of the closest data point
    return parseFloat(data[closestIndex].capacity);
  }

  // Set margins and dimensions
  const margin = { top: 30, right: 60, bottom: 80, left: 60 };
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  // Create x scale
  const x = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.cycleNum), d3.max(data, (d) => d.cycleNum)])
    .range([margin.left, width - margin.right]);

  // Create y scale
  const y = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => +d.capacity) - 0.1,
      d3.max(data, (d) => +d.capacity + 0.1),
    ])
    .range([height - margin.bottom, margin.top]);

  // Add x axis
  const xAxis = d3.axisBottom(x).tickSizeOuter(0);
  const xAxisGroup = svg
    .append("g")
    .attr("class", "x-axis-cycle")
    .call(xAxis)
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(parentWidth / 200));

  const xAxisLabel = xAxisGroup
    .append("text") // X axis label
    .attr("x", width / 2)
    .attr("y", margin.bottom * 0.6)
    .attr("text-anchor", "middle")
    .text("\u270F\uFE0F CYCLE")
    .style("font-size", "1vw")
    .classed("axis-label", true)
    .style("fill", "black")
    .on("click", handleXAxisLabelClick);

  // Add y axis
  const yAxis = d3.axisLeft(y).tickSizeOuter(0);
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(parentWidth / 100))
    .append("text") // Y axis label for current
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left * 1)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text("\u270F\uFE0F CAPACITY")
    .style("font-size", "1vw")

    .classed("axis-label", true)
    .style("fill", "black")
    .on("click", handleYAxisLabelClick);

  // Define clip path
  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "scatter-clip")
    .append("rect")
    .attr(
      "width",
      width - margin.left - margin.right >= 0
        ? width - margin.left - margin.right
        : 0
    )
    .attr(
      "height",
      height - margin.top - margin.bottom >= 0
        ? height - margin.top - margin.bottom
        : 0
    )
    .attr("x", margin.left)
    .attr("y", margin.top);

  //   // Add scatter points
  filterChart == "Scatter" &&
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.cycleNum))
      .attr("cy", (d) => y(+d.capacity))
      .attr("r", 2) // Adjust the radius of the circles as needed
      .attr("fill",legendColorCapacity)
      .attr("clip-path", "url(#scatter-clip)");

  // Create line generator
  const line = d3
    .line()
    .x((d) => x(d.cycleNum))
    .y((d) => y(+d.capacity));

  // Add line to SVG
  filterChart == "Line" &&
    svg
      .append("path")
      .attr("class", "paths")
      .attr("clip-path", "url(#clip)")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", legendColorCapacity)
      .attr("stroke-width", 3)
      .attr("d", line)
      .classed("pathCapacity", true);

  // Legend
  svg
    .append("text")
    .attr("x", width - margin.right)
    .attr("y", margin.top)
    .attr("class", "legend")
    .style("fill", legendColorCapacity)
    .text("\u270F\uFE0F Capacity")
    .attr("text-anchor", "end")
    .style("font-size", "1vw")
    .style("alignment-baseline", "middle")
    .classed("legend-capacity legend", true)
    .on("click", handleCapacityLegendClick);

  // Enable zooming
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [margin.left, margin.right],
      [width - margin.left, height - margin.right],
    ])
    .extent([
      [margin.left, margin.right],
      [width - margin.left, height - margin.right],
    ])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed(event) {
    const newX = event.transform.rescaleX(x);
    const newY = event.transform.rescaleY(y);

    svg.select(".x-axis-cycle").call(xAxis.scale(newX));
    svg.select(".y-axis").call(yAxis.scale(newY));

    // Update paths
    filterChart == "Line" &&
      svg.select(".paths").attr(
        "d",
        line.x((d) => newX(d.cycleNum))
      );
    filterChart == "Line" &&
      svg.select(".paths").attr(
        "d",
        line.y((d) => newY(d.capacity))
      );

    // Update dot
    filterChart == "Scatter" &&
      svg
        .selectAll(".dot")
        .attr("cx", (d) => newX(d.cycleNum))
        .attr("cy", (d) => newY(+d.capacity));
  }
}


export function drawChartTimeCurrent(
  data,
  chartRef,
  filterChart,
  handleXAxisLabelClick,
  handleYCurrentAxisLabelClick,
  handleYVoltageAxisLabelClick,
  handleCurrentLegendClick,
  handleVoltageLegendClick,
  setTooltipX,
  setTooltipYCurrent,
  setTooltipYVoltage,
  filterCurrentVoltage
) {
  // Clear previous chart if it exists
  d3.select(chartRef.current).selectAll("*").remove();

  // Get dimensions of the parent container
  const parentWidth = chartRef.current.clientWidth;

  // Access the DOM element to draw the chart
  const svg = d3
    .select(chartRef.current)
    .append("svg")
    .attr("width", parentWidth)
    .attr("height", parentWidth > 500 ? parentWidth / 2.5 : 200)
    .on("mousemove", function (event) {
      const [mouseX, mouseY] = d3.pointer(event, svg.node());
      if (mouseX >= margin.left && mouseX <= width - margin.right) {
        // Invert scales to get corresponding x and y values
        const xValue = x.invert(mouseX);
        const yValue = getYValueAtX(xValue);
        setTooltipX(xValue.toFixed(0));
        setTooltipYCurrent(yValue[0].toFixed(6));
        setTooltipYVoltage(yValue[1].toFixed(6));
      }
    });

  function getYValueAtX(xValue) {
    const bisect = d3.bisector((d) => d.cycleTime).left;
    const index = bisect(data, xValue);
    let closestIndex;
    if (index === 0) {
      closestIndex = index;
    } else if (index >= data.length) {
      closestIndex = data.length - 1;
    } else {
      const leftDistance = Math.abs(data[index - 1].cycleNum - xValue);
      const rightDistance = Math.abs(data[index].cycleNum - xValue);
      closestIndex = leftDistance < rightDistance ? index - 1 : index;
    }

    const result = [
      parseFloat(data[closestIndex].current),
      parseFloat(data[closestIndex].voltage),
    ];

    // Return the y value of the closest data point
    return result;
  }

  // Set margins and dimensions
  const margin = { top: 30, right: 60, bottom: 80, left: 60 }; // Increased bottom and left margin for axis labels
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  // Create x scale
  const x = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d.cycleTime),
      d3.max(data, (d) => d.cycleTime),
    ])
    .range([margin.left, width - margin.right]);

  // Create y scale for current
  const yCurrent = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => +d.current) - 0.003,
      d3.max(data, (d) => +d.current) + 0.003,
    ])
    .range([height - margin.bottom, margin.top]);

  // Create y scale for voltage
  const yVoltage = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => +d.voltage) - 0.1,
      d3.max(data, (d) => +d.voltage) + 0.1,
    ])
    .range([height - margin.bottom, margin.top]);

  // Add x axis
  const xAxis = d3.axisBottom(x).tickSizeOuter(0);
  svg
    .append("g")
    .attr("class", "x-axis-time")
    .call(xAxis)
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(parentWidth / 100))
    .append("text") // X axis label
    .attr("x", width / 2)
    .attr("y", margin.bottom * 0.6)
    .attr("text-anchor", "middle")
    .text("\u270F\uFE0F CYCLE TIME (seconds)")
    .style("fill", "black")
    .style("font-size", "1vw")
    .classed("axis-label", true)
    .on("click", handleXAxisLabelClick);

  // Add y axis for current
  const yAxisCurrent = d3.axisLeft(yCurrent).tickSizeOuter(0);
  filterCurrentVoltage.Current &&
    svg
      .append("g")
      .attr("class", "y-axis-current")
      .call(yAxisCurrent)
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yCurrent).ticks(parentWidth / 150))
      .append("text") // Y axis label for current
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left * 1)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text("\u270F\uFE0F CURRENT (A)")
      .style("font-size", "1vw")
      .style("fill", "black")
      .classed("axis-label", true)
      .on("click", handleYCurrentAxisLabelClick);

  // Add y axis for voltage
  const yAxisVoltage = d3.axisRight(yVoltage).tickSizeOuter(0);
  filterCurrentVoltage.Voltage &&
    svg
      .append("g")
      .attr("class", "y-axis-voltage")
      .call(yAxisVoltage)
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yVoltage).ticks(parentWidth / 150))
      .append("text") // Y axis label for voltage
      .attr("transform", "rotate(-90)")
      .attr("y", margin.right * 0.5) // Adjusted positioning
      .attr("x", -height / 2) // Adjusted positioning
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text("\u270F\uFE0F VOLTAGE (V)")
      .style("font-size", "1vw")
      .classed("axis-label", true)
      .on("click", handleYVoltageAxisLabelClick);

  // Define clip path
  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr(
      "width",
      width - margin.left - margin.right >= 0
        ? width - margin.left - margin.right
        : 0
    )
    .attr(
      "height",
      height - margin.top - margin.bottom >= 0
        ? height - margin.top - margin.bottom
        : 0
    )
    .attr("x", margin.left)
    .attr("y", margin.top);

  // Add scatter points for current
  filterChart == "Scatter" &&
    filterCurrentVoltage.Current &&
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot-current")
      .attr("cx", (d) => x(d.cycleTime))
      .attr("cy", (d) => yCurrent(+d.current))
      .attr("r", 4)
      .attr("fill", "blue")
      .attr("clip-path", "url(#scatter-clip)");

  // Add scatter points for voltage
  filterChart == "Scatter" &&
    filterCurrentVoltage.Voltage &&
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot-voltage")
      .attr("cx", (d) => x(d.cycleTime))
      .attr("cy", (d) => yVoltage(+d.voltage))
      .attr("r", 4)
      .attr("fill", "orange")
      .attr("clip-path", "url(#scatter-clip)");

  // Create line generator for current
  const lineCurrent = d3
    .line()
    .x((d) => x(d.cycleTime))
    .y((d) => yCurrent(+d.current));

  // Create line generator for voltage
  const lineVoltage = d3
    .line()
    .x((d) => x(d.cycleTime))
    .y((d) => yVoltage(+d.voltage));

  // Add line for current to SVG
  // If user unselect current in the filter, then the line for current will not be created.
  filterChart == "Line" &&
    filterCurrentVoltage.Current &&
    svg
      .append("path")
      .attr("class", "pathCurrent")
      .attr("clip-path", "url(#clip)")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 3)
      .attr("d", lineCurrent);

  // Add line for voltage to SVG
  // If user unselect current in the filter, then the line for voltage will not be created.
  filterChart == "Line" &&
    filterCurrentVoltage.Voltage &&
    svg
      .append("path")
      .attr("class", "pathVoltage")
      .attr("clip-path", "url(#clip)")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 3)
      .attr("d", lineVoltage);

  // Legend for current
  filterCurrentVoltage.Current &&
    svg
      .append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.top)
      .attr("fill", "blue")
      .text("\u270F\uFE0F Current")
      .attr("text-anchor", "end")
      .style("alignment-baseline", "middle")
      .style("font-size", "1vw")
      .classed("legend-current legend", true)
      .on("click", handleCurrentLegendClick);

  // Legend for voltage
  filterCurrentVoltage.Voltage &&
    svg
      .append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.top + 20)
      .attr("fill", "orange")
      .text("\u270F\uFE0F Voltage")
      .attr("text-anchor", "end")
      .style("alignment-baseline", "middle")
      .style("font-size", "1vw")
      .classed("legend-voltage legend", true)
      .on("click", handleVoltageLegendClick);

  // Enable zooming
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [margin.left, margin.right],
      [width - margin.left, height - margin.right],
    ])
    .extent([
      [margin.left, margin.right],
      [width - margin.left, height - margin.right],
    ])
    .on("zoom", zoomed);

  svg.call(zoom);
  function zoomed(event) {
    const newX = event.transform.rescaleX(x);
    const newYCurrent = event.transform.rescaleY(yCurrent);
    const newYVoltage = event.transform.rescaleY(yVoltage);

    // Update x axis line position without modifying the scale range
    svg.select(".x-axis-time").call(xAxis.scale(newX));

    // Update y axis lines' positions without modifying the scale range
    svg.select(".y-axis-current").call(yAxisCurrent.scale(newYCurrent));
    svg.select(".y-axis-voltage").call(yAxisVoltage.scale(newYVoltage));

    // Update paths
    svg.select(".pathVoltage").attr(
      "d",
      lineVoltage.x((d) => newX(d.cycleTime))
    );
    svg.select(".pathVoltage").attr(
      "d",
      lineVoltage.y((d) => newYVoltage(d.voltage))
    );

    svg.select(".pathCurrent").attr(
      "d",
      lineCurrent.x((d) => newX(d.cycleTime))
    );

    svg.select(".pathCurrent").attr(
      "d",
      lineCurrent.y((d) => newYCurrent(d.current))
    );

    // Update dot
    filterChart == "Scatter" &&
      svg
        .selectAll(".dot-current")
        .attr("cx", (d) => newX(d.cycleTime))
        .attr("cy", (d) => newYCurrent(+d.current));

    svg
      .selectAll(".dot-voltage")
      .attr("cx", (d) => newX(d.cycleTime))
      .attr("cy", (d) => newYVoltage(+d.voltage));
  }
}
