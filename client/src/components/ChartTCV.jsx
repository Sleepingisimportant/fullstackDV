import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import DownloadChart from "./DownloadChart";
import PopupAxisLable from "./PopupAxisLable";
import PopupLegendColor from "./PopupLegendColor";
import PopupFilterCondition from "./PopupFilterCondition";
import FilterChartType from "./FilterChartType";
import FilterLegned from "./FilterLegend";
import FilterData from "./FilterData";
import { drawChartTimeCurrent } from "./drawChart";
import hosting from "./hosting";
import ComponentTooltip from "./ComponentTooltip";

function ChartTCV({ selectedFileID, selectedCycleNum }) {
  const [data, setData] = useState([]);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipYCurrent, setTooltipYCurrent] = useState(0);
  const [tooltipYVoltage, setTooltipYVoltage] = useState(0);
  const [selectedAxis, setSelectedAxis] = useState("");
  const [showPopupRenameLabel, setShowPopupRenameLabel] = useState(false);
  const [showPopupColorLegend, setShowPopupColorLegend] = useState(false);
  const [showPopupFilterCurrent, setShowPopupFilterCurrent] = useState(false);
  const [showPopupFilterVoltage, setShowPopupFilterVoltage] = useState(false);
  const [selectedLegend, setSelectedLegend] = useState("");
  const [filterChart, setFilterChart] = useState("Line");
  const [currentFilter, setCurrentFilter] = useState([]);
  const [voltageFilter, setVoltageFilter] = useState([]);
  const [latestSetFilter, setLatestSetFilter] = useState("");
  const [legendColorCurrent, setLegendColorCurrent] = useState("blue");
  const [legendColorVoltage, setLegendColorVoltage] = useState("orange");

  const [filterCurrentVoltage, setFilterCurrentVoltage] = useState({
    Voltage: true,
    Current: true,
  });
  const chartRef = useRef();

  useEffect(() => {
    // api - fetch current voltage data when the selected file and cycle is updated
    const fetchData = async () => {
      try {
        const currentFilterString = JSON.stringify(currentFilter);
        const voltageFilterString = JSON.stringify(voltageFilter);

        const url = `${hosting}/getTCV/${selectedFileID}/${selectedCycleNum}/${currentFilterString}/${voltageFilterString}`;
        selectedFileID != null &&
          selectedCycleNum != null &&
          (await fetch(url)
            .then((response) => {
              if (response.status !== 200) {
                throw new Error("Fetch data fail!");
              }
              return response.json();
            })
            .then((data) => {
              //if filter return no data, then delete the filter
              setData(data);
              if (latestSetFilter && data.length === 0) {
                if (latestSetFilter == "current") {
                  setCurrentFilter((prevCurrentFilter) => {
                    const newCurrentFilter = prevCurrentFilter.slice(0, -1);
                    return newCurrentFilter;
                  });
                } else {
                  setVoltageFilter((prevVoltageFilter) => {
                    const newVoltageFilter = prevVoltageFilter.slice(0, -1);
                    return newVoltageFilter;
                  });
                }
              } else {
                setData(data);
              }
            }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedFileID, selectedCycleNum, currentFilter, voltageFilter]);

  useEffect(() => {
    if (data.length === 0) return;
    // Clear previous chart if it exists
    d3.select(chartRef.current).selectAll("*").remove();

    drawChartTimeCurrent(
      data,
      chartRef,
      filterChart,
      legendColorCurrent,
      legendColorVoltage,
      handleXAxisLabelClick,
      handleYCurrentAxisLabelClick,
      handleYVoltageAxisLabelClick,
      handleCurrentLegendClick,
      handleVoltageLegendClick,
      setTooltipX,
      setTooltipYCurrent,
      setTooltipYVoltage,
      filterCurrentVoltage
    );

    // Update SVG dimensions when the window is resized
    window.addEventListener("resize", () => {
      // Clear previous chart if it exists
      d3.select(chartRef.current).selectAll("*").remove();

      drawChartTimeCurrent(
        data,
        chartRef,
        filterChart,
        legendColorCurrent,
        legendColorVoltage,
        handleXAxisLabelClick,
        handleYCurrentAxisLabelClick,
        handleYVoltageAxisLabelClick,
        handleCurrentLegendClick,
        handleVoltageLegendClick,
        setTooltipX,
        setTooltipYCurrent,
        setTooltipYVoltage,
        filterCurrentVoltage
      );
    });
  }, [data, filterCurrentVoltage, filterChart]);

  const handleFilterItemClick = (filterName) => {
    if (
      (filterName == "Current" && !filterCurrentVoltage.Voltage) ||
      (filterName == "Voltage" && !filterCurrentVoltage.Current)
    ) {
      return;
    }
    setFilterCurrentVoltage((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };

  const handleXAxisLabelClick = () => {
    setSelectedAxis("X");
    setShowPopupRenameLabel(true);
  };

  const handleYCurrentAxisLabelClick = () => {
    setSelectedAxis("YCurrent");
    setShowPopupRenameLabel(true);
  };

  const handleYVoltageAxisLabelClick = () => {
    setSelectedAxis("YVoltage");
    setShowPopupRenameLabel(true);
  };

  const handlePopupRenameLabelSubmit = (newLabel) => {
    if (selectedAxis == "X") {
      const xAxisLabel = d3.select(".x-axis-time .axis-label");
      xAxisLabel.text("\u270F\uFE0F " + newLabel);
    } else if (selectedAxis == "YCurrent") {
      const yCurrentAxisLabel = d3.select(".y-axis-current .axis-label");
      yCurrentAxisLabel.text("\u270F\uFE0F " + newLabel);
    } else {
      const yVoltageAxisLabel = d3.select(".y-axis-voltage .axis-label");
      yVoltageAxisLabel.text("\u270F\uFE0F " + newLabel);
    }
  };

  const handleCurrentLegendClick = () => {
    setShowPopupColorLegend(true);
    setSelectedLegend("current");
  };

  const handleVoltageLegendClick = () => {
    setShowPopupColorLegend(true);
    setSelectedLegend("voltage");
  };

  const handlePopupColorLegendSubmit = (color) => {
    let legend;
    let path;

    if (selectedLegend == "current") {
      legend = d3.select(".legend-current");
      legend.style("fill", color);
      setLegendColorCurrent(color);

      if (filterChart === "Line") {
        path = d3.select(".pathCurrent");
        path.style("stroke", color);
      } else {
        const dots = d3.selectAll(".dot-current");
        dots.style("fill", color);
      }
    } else {
      legend = d3.select(".legend-voltage");
      legend.style("fill", color);
      setLegendColorVoltage(color);

      if (filterChart === "Line") {
        path = d3.select(".pathVoltage");
        path.style("stroke", color);
      } else {
        const dots = d3.selectAll(".dot-voltage");
        dots.style("fill", color);
      }
    }
  };

  const handlePopupCurrentFilter = (notation, value) => {
    const index = currentFilter.findIndex(
      (filter) => filter.notation === notation
    );
    if (index !== -1) {
      const updatedFilter = [...currentFilter];
      updatedFilter[index] = { notation: notation, value: value };
      setCurrentFilter(updatedFilter);
    } else {
      const newFilter = { notation: notation, value: value };
      setCurrentFilter([...currentFilter, newFilter]);
    }
    setLatestSetFilter("current");
  };

  const handlePopupVoltageFilter = (notation, value) => {
    const index = voltageFilter.findIndex(
      (filter) => filter.notation === notation
    );
    if (index !== -1) {
      const updatedFilter = [...voltageFilter];
      updatedFilter[index] = { notation: notation, value: value };
      setVoltageFilter(updatedFilter);
    } else {
      const newFilter = { notation: notation, value: value };
      setVoltageFilter([...voltageFilter, newFilter]);
    }
    setLatestSetFilter("voltage");
  };

  const handleFilterChartType = (chartType) => {
    setFilterChart(chartType);
  };

  return (
    <>
      {data.length != 0 ? (
        <>
          {showPopupRenameLabel && (
            <PopupAxisLable
              onClose={() => setShowPopupRenameLabel(false)}
              onSubmit={handlePopupRenameLabelSubmit}
            />
          )}
          {showPopupColorLegend && (
            <PopupLegendColor
              onClose={() => setShowPopupColorLegend(false)}
              onSubmit={handlePopupColorLegendSubmit}
            />
          )}
          {showPopupFilterCurrent && (
            <PopupFilterCondition
              filter="CURRENT"
              onClose={() => setShowPopupFilterCurrent(false)}
              onSubmit={handlePopupCurrentFilter}
            />
          )}
          {showPopupFilterVoltage && (
            <PopupFilterCondition
              filter="VOLTAGE"
              onClose={() => setShowPopupFilterVoltage(false)}
              onSubmit={handlePopupVoltageFilter}
            />
          )}
          <FilterChartType
            filterChartType={filterChart}
            onFilter={handleFilterChartType}
          />
          <FilterLegned
            filter={filterCurrentVoltage}
            handleFilterItemClick={handleFilterItemClick}
          />
          {filterCurrentVoltage.Current && (
            <FilterData
              filterType="Current"
              filter={currentFilter}
              filterCondition={handlePopupCurrentFilter}
            />
          )}
          {filterCurrentVoltage.Voltage && (
            <FilterData
              filterType="Voltage"
              filter={voltageFilter}
              filterCondition={handlePopupVoltageFilter}
            />
          )}
          <div className="chart-container  flex-grow-1" ref={chartRef}></div>
          <ComponentTooltip
            tooltipX={tooltipX}
            tooltipYCurrent={tooltipYCurrent}
            tooltipYVoltage={tooltipYVoltage}
          />
          <DownloadChart chartRef={chartRef} />
        </>
      ) : (
        <div className="chart-container"> NO DATA TO SHOW</div>
      )}
    </>
  );
}

export default ChartTCV;
