//scatter chart
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import DownloadChart from "./DownloadChart";
import hosting from "./hosting";
import PopupAxisLable from "./PopupAxisLable";
import PopupLegendColor from "./PopupLegendColor";
import FilterData from "./FilterData";
import FilterChartType from "./FilterChartType";
import { drawChartCapacity } from "./drawChart";
import ComponentTooltip from "./ComponentTooltip";

function ChartCapacity({ selectedFileID }) {
  const [data, setData] = useState([]);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [showPopupRenameLabel, setShowPopupRenameLabel] = useState(false);
  const [showPopupColorLegend, setShowPopupColorLegend] = useState(false);
  const [capacityFilter, setCapacityFilter] = useState([]);
  const [selectedAxis, setSelectedAxis] = useState("");
  const [filterChart, setFilterChart] = useState("Line");
  const [legendColorCapacity, setLegendColorCapacity] = useState("green");

  const chartRef = useRef(null);

  useEffect(() => {
    // api-fetch capacity data when the selected file is updated
    const fetchData = async () => {
      try {
        const capacityFilterString = JSON.stringify(capacityFilter);
        const url = `${hosting}/getCapacity/${selectedFileID}/${capacityFilterString}`;
        const result = await fetch(url)
          .then((response) => {
            if (response.status !== 200) {
              throw new Error("Fetch data fail!");
            }
            return response.json();
          })
          .then((data) => {
            //if filter return no data, then delete the filter
            if (capacityFilter.length > 0 && data.length === 0) {
              setCapacityFilter((prevCapacityFilter) => {
                const newCapacityFilter = prevCapacityFilter.slice(0, -1);
                return newCapacityFilter;
              });
            } else {
              setData(data);
            }
            return data;
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedFileID, capacityFilter]);

  useEffect(() => {
    if (data.length === 0) return;

    // Clear previous chart if it exists
    d3.select(chartRef.current).selectAll("*").remove();

    // drawChart();
    drawChartCapacity(
      data,
      chartRef,
      filterChart,
      legendColorCapacity,
      handleXAxisLabelClick,
      handleYAxisLabelClick,
      handleCapacityLegendClick,
      setTooltipX, // Pass tooltip handlers
      setTooltipY
    );

    // Update SVG dimensions when the window is resized
    window.addEventListener("resize", () => {
      // Clear previous chart if it exists
      d3.select(chartRef.current).selectAll("*").remove();

      // drawChart();
      drawChartCapacity(
        data,
        chartRef,
        filterChart,
        legendColorCapacity,
        handleXAxisLabelClick,
        handleYAxisLabelClick,
        handleCapacityLegendClick,
        setTooltipX, // Pass tooltip handlers
        setTooltipY
      );
    });
  }, [data, filterChart]);

  const handleXAxisLabelClick = () => {
    setSelectedAxis("X");
    setShowPopupRenameLabel(true);
  };

  const handleYAxisLabelClick = () => {
    setSelectedAxis("Y");
    setShowPopupRenameLabel(true);
  };

  const handlePopupRenameLabelSubmit = (newLabel) => {
    if (selectedAxis == "X") {
      const xAxisLabel = d3.select(".x-axis-cycle .axis-label");
      xAxisLabel.text("\u270F\uFE0F " + newLabel);
    } else {
      const yAxisLabel = d3.select(".y-axis .axis-label");
      yAxisLabel.text("\u270F\uFE0F " + newLabel);
    }
  };

  const handleCapacityLegendClick = () => {
    setShowPopupColorLegend(true);
  };

  const handlePopupColorLegendSubmit = (color) => {
    const legend = d3.select(".legend-capacity");
    legend.style("fill", color);
    setLegendColorCapacity(color);

    if (filterChart === "Line") {
      const paths = d3.select(".paths");
      paths.style("stroke", color);
    } else {
      const dots = d3.selectAll(".dot");
      dots.style("fill", color);
    }
  };

  const handlePopupCapacityFilter = (notation, value) => {
    const index = capacityFilter.findIndex(
      (filter) => filter.notation === notation
    );
    if (index !== -1) {
      const updatedFilter = [...capacityFilter];
      updatedFilter[index] = { notation: notation, value: value };
      setCapacityFilter(updatedFilter);
    } else {
      const newFilter = { notation: notation, value: value };
      setCapacityFilter([...capacityFilter, newFilter]);
    }
  };

  const handleFilterChartType = (chartType) => {
    setFilterChart(chartType);
  };

  return (
    <>
      {data.length != 0 ? (
        <>
          {showPopupRenameLabel ? (
            <PopupAxisLable
              onClose={() => setShowPopupRenameLabel(false)}
              onSubmit={handlePopupRenameLabelSubmit}
            />
          ) : null}
          {showPopupColorLegend ? (
            <PopupLegendColor
              onClose={() => setShowPopupColorLegend(false)}
              onSubmit={handlePopupColorLegendSubmit}
            />
          ) : null}

          <FilterChartType
            filterChartType={filterChart}
            onFilter={handleFilterChartType}
          />
          <FilterData
            filterType="Capacity"
            filter={capacityFilter}
            filterCondition={handlePopupCapacityFilter}
          />

          <div className="chart-container  flex-grow-1" ref={chartRef}></div>

          <ComponentTooltip tooltipX={tooltipX} tooltipY={tooltipY} />

          <DownloadChart chartRef={chartRef} />
        </>
      ) : (
        <div className="chart-container"> NO DATA TO SHOW</div>
      )}
    </>
  );
}

export default ChartCapacity;
