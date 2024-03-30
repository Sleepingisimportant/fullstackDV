// FilterArea.jsx

import React ,{useState}from "react";
import PopupLegendColor from "./PopupLegendColor";


function FilterLegend({ filter, handleFilterItemClick }) {
  const [showPopupColorLegend, setShowPopupColorLegend] = useState(false);
 
  return (
    <>
      {showPopupColorLegend ? (
        <PopupLegendColor
          onClose={() => setShowPopupColorLegend(false)}
          onSubmit={handlePopupColorLegendSubmit}
        />
      ) : null}
      <div className="filter-area">
        <div className="filter-type">Filter By Legend</div>
        {Object.keys(filter).map((key, index) => (
          <div
            key={index}
            className={`filter-item ${!filter[key] && "disabled"}`}
            onClick={() => handleFilterItemClick(key)}
          >
            {key}
          </div>
        ))}
      </div>
    </>
  );
}

export default FilterLegend;
