import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { downloadChart } from "./DownloadChart";

function ChartTCV({ selectedFileID, selectedCycleNum, filterCurrentVoltage }) {
  const [data, setData] = useState([]);
  const chartRef = useRef();

  useEffect(() => {
    // api - fetch current voltage data when the selected file and cycle is updated
    const fetchData = async () => {
      try {
        const result = await fetch(
          `http://localhost:3000/getTCV/${selectedFileID}/${selectedCycleNum}`
        )
          .then((response) => {
            if (response.status !== 200) {
              throw new Error("Fetch data fail!");
            }
            return response.json();
          })
          .then((data) => {
            setData(data);
            return data;
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedFileID, selectedCycleNum]);

  useEffect(() => {
    if (data.length === 0) return;
    // Clear previous chart if it exists
    d3.select(chartRef.current).selectAll("*").remove();
    drawChart();

    // Update SVG dimensions when the window is resized
    window.addEventListener("resize", () => {
      // Clear previous chart if it exists
      d3.select(chartRef.current).selectAll("*").remove();
      drawChart();
    });
  }, [data, filterCurrentVoltage]);

  function drawChart() {
    // Clear previous chart if it exists
    d3.select(chartRef.current).selectAll("*").remove();

    // Get dimensions of the parent container
    const parentWidth = chartRef.current.clientWidth;

    // Access the DOM element to draw the chart
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", parentWidth)
      .attr("height", parentWidth / 2.5);

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
      .attr("class", "x-axis")
      .call(xAxis)
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(parentWidth / 100))
      .append("text") // X axis label
      .attr("x", width / 2)
      .attr("y", margin.bottom * 0.6)
      .attr("text-anchor", "middle")
      .text("Cycle Time (seconds)")
      .classed("axis-label", true);

    // Add y axis for current
    const yAxisCurrent = d3.axisLeft(yCurrent).tickSizeOuter(0);
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
      .text("Current (A)")
      .classed("axis-label", true);

    // Add y axis for voltage
    const yAxisVoltage = d3.axisRight(yVoltage).tickSizeOuter(0);
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
      .text("Voltage (V)")
      .classed("axis-label", true);

    // Define clip path
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top);

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
    filterCurrentVoltage.Current &&
      svg
        .append("path")
        .attr("class", "pathCurrent")
        .attr("clip-path", "url(#clip)")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#FFC700")
        .attr("stroke-width", 3)
        .attr("d", lineCurrent);

    // Add line for voltage to SVG
    // If user unselect current in the filter, then the line for voltage will not be created.
    filterCurrentVoltage.Voltage &&
      svg
        .append("path")
        .attr("class", "pathVoltage")
        .attr("clip-path", "url(#clip)")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#4CCD99")
        .attr("stroke-width", 3)
        .attr("d", lineVoltage);

    // Legend for current
    svg
      .append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.top)
      .attr("fill", "#FFC700")
      .text("Current")
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("alignment-baseline", "middle");

    // Legend for voltage
    svg
      .append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.top + 20)
      .attr("fill", "#4CCD99")
      .text("Voltage")
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("alignment-baseline", "middle");

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
      svg.select(".x-axis").call(xAxis.scale(newX));

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
    }
  }

  return (
    <>
      {data.length != 0 ? (
        <>
          <div className="chart-container  flex-grow-1" ref={chartRef}></div>
          <div className="button-container">
            <div className={` button `} onClick={() => downloadChart(chartRef)}>
              DOWNLOAD CHART
            </div>
          </div>
        </>
      ) : (
        <div className="chart-container"> NO DATA TO SHOW</div>
      )}
    </>
  );
}

export default ChartTCV;
