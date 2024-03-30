import React from "react";

function ComponentTooltip({ tooltipX, tooltipYCurrent = null, tooltipYVoltage = null, tooltipY = null }) {
  return (
  
    <div className="tooltip-area">
      <div className="tooltip-type">
        Time:<span className="tooltip-value">{tooltipX}</span>
      </div>

      {tooltipY!=null && (
        <div className="tooltip-type">
          Capacity:<span className="tooltip-value">{tooltipY}</span>
        </div>
      )}

      {tooltipYCurrent!=null  && (
        <div className="tooltip-type">
          Current:<span className="tooltip-value">{tooltipYCurrent}</span>
        </div>
      )}
      {tooltipYVoltage!=null  && (
        <div className="tooltip-type">
          Voltage:<span className="tooltip-value">{tooltipYVoltage}</span>
        </div>
      )}
     
    </div>
  );
}

export default ComponentTooltip;
