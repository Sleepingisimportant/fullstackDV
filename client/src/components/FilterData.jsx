// CapacityFilter.jsx

import React, { useState } from "react";
import PopupFilterCondition from "./PopupFilterCondition";

const notationMapping = {
  greater: ">",
  smaller: "<",
  greaterEqual: ">=",
  smallerEqual: "<=",
  equal: "=",
};

function FilterData({ filterType, filter, filterCondition }) {
  const [showPopupFilterCapacity, setShowPopupFilterCapacity] = useState(false);
  const [showPopupFilterCurrent, setShowPopupFilterCurrent] = useState(false);
  const [showPopupFilterVoltage, setShowPopupFilterVoltage] = useState(false);

  const handlePopupCapacityFilterClick = () => {
    setShowPopupFilterCapacity(true);
  };
  const handlePopupCurrentFilterClick = () => {
    setShowPopupFilterCurrent(true);
  };
  const handlePopupVoltageFilterClick = () => {
    setShowPopupFilterVoltage(true);
  };

  return (
    <>
      {filterType == "Capacity" && showPopupFilterCapacity && (
        <PopupFilterCondition
          filter="CAPACITY"
          onClose={() => setShowPopupFilterCapacity(false)}
          onSubmit={filterCondition}
        />
      )}
      {filterType == "Current" && showPopupFilterCurrent && (
        <PopupFilterCondition
          filter="CURRENT"
          onClose={() => setShowPopupFilterCurrent(false)}
          onSubmit={filterCondition}
        />
      )}
      {filterType == "Voltage" && showPopupFilterVoltage && (
        <PopupFilterCondition
          filter="VOLTAGE"
          onClose={() => setShowPopupFilterVoltage(false)}
          onSubmit={filterCondition}
        />
      )}
      <div className="filter-area">
        <div className="filter-type">Filter By {filterType}</div>
        {filter.length > 0 && (
          <>
            {filter.map((filter, index) => (
              <div className="filter-add-condition-item" key={index}>
                {`${filterType} ${notationMapping[filter.notation]}  ${
                  filter.value
                }`}
              </div>
            ))}
          </>
        )}
        <div
          className="filter-add-condition"
          onClick={() => {
            if (filterType === "Capacity") {
              handlePopupCapacityFilterClick();
            } else if (filterType === "Current") {
              handlePopupCurrentFilterClick();
            } else {
              handlePopupVoltageFilterClick();
            }
          }}
        >
          Add condition +
        </div>
      </div>
    </>
  );
}

export default FilterData;
