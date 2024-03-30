import React from "react";

function FilterChartType({ filterChartType, onFilter }) {
  return (
    <div className="filter-area">
      <div className="filter-type">Select Chart Type</div>
      <div
        className={`filter-item ${filterChartType === "Scatter" && "disabled"}`}
        onClick={() => onFilter("Line")} 
      >
        Line
      </div>
      <div
        className={`filter-item ${filterChartType === "Line" && "disabled"}`}
        onClick={() => onFilter("Scatter")} 
      >
        Scatter
      </div>
    </div>
  );
}

export default FilterChartType;
