import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { downloadChart } from "./DownloadChart";

function ChartCapacity({ selectedFileID, dataExist }) {
  const [data, setData] = useState([]);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);

  const chartRef = useRef(null);

  useEffect(() => {
    // api-fetch capacity data when the selected file is updated
    const fetchData = async () => {
      try {
        const result = await fetch(
          `https://fullstackdvserver.onrender.com/getCapacity/${selectedFileID}`
        )
          .then((response) => {
            if (response.status !== 200) {
              throw new Error("Fetch data fail!");
            }
            return response.json();
          })
          .then((data) => {
            setData(data);
            if (data.length > 0) {
              dataExist(true);
            }
            return data;
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedFileID]);

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
  }, [data]);

  function drawChart() {
    const parentWidth = chartRef.current.clientWidth;
    // Access the DOM element to draw the chart
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", parentWidth)
      .attr("height", parentWidth>500? parentWidth/ 2.5:200)
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event, svg.node());
        if (mouseX >= margin.left && mouseX <= width - margin.right) {
          // Invert scales to get corresponding x and y values
          const xValue = x.invert(mouseX);
          const yValue = getYValueAtX(xValue);
          setTooltipX(xValue.toFixed(0));
          setTooltipY(yValue.toFixed(2));
        }
      });

    function getYValueAtX(xValue) {
      // Use d3.bisector to find the index in the data array corresponding to the x value
      const bisect = d3.bisector((d) => d.cycleNum).left;
      const index = bisect(data, xValue);

      // Determine which point is closer to the xValue
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
      .domain([
        d3.min(data, (d) => d.cycleNum),
        d3.max(data, (d) => d.cycleNum),
      ])
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
      .text("CYCLE")
      .classed("axis-label", true);

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
      .text("CAPACITY")
      .classed("axis-label", true);

    // Define clip path
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width - margin.left - margin.right>=0?width - margin.left - margin.right:0)
      .attr("height", height - margin.top - margin.bottom>=0?height - margin.top - margin.bottom:0)
      .attr("x", margin.left)
      .attr("y", margin.top);

    // Create line generator
    const line = d3
      .line()
      .x((d) => x(d.cycleNum))
      .y((d) => y(+d.capacity));

    const tooltipArea = d3.select(".tooltip-area");

    // Add line to SVG
    svg
      .append("path")
      .attr("class", "paths")
      .attr("clip-path", "url(#clip)")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#00A9FF")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Legend
    svg
      .append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.top)
      .attr("fill", "#00A9FF")
      .text("Capacity")
      .attr("text-anchor", "end")
      .style("font-size", "1.2vw")
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
      const newY = event.transform.rescaleY(y);

      svg.select(".x-axis").call(xAxis.scale(newX));
      svg.select(".y-axis").call(yAxis.scale(newY));

      // Update paths
      svg.select(".paths").attr(
        "d",
        line.x((d) => newX(d.cycleNum))
      );
      svg.select(".paths").attr(
        "d",
        line.y((d) => newY(d.capacity))
      );
    }
  }

  return (
    <>
      {data.length != 0 ? (
        <>
          <div className="tooltip-area">
            <div className="tooltip-type">
              Cycle:<span className="tooltip-value">{tooltipX}</span>
            </div>
            <div className="tooltip-type">
              Capacity:<span className="tooltip-value">{tooltipY}</span>
            </div>
          </div>
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

export default ChartCapacity;
