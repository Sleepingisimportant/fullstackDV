import React, { useState } from "react";

function PopupAxisLable({ onClose, onSubmit }) {
  const [newLabel, setNewLabel] = useState("");

  const handleInputChange = (event) => {
    setNewLabel(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit(newLabel);
    setNewLabel("");
    onClose();
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className={`popup`}>
      <div className="popup-inner">
        <div className="block-subtitle">RENAME LABEL</div>
        <input
          type="text"
          value={newLabel}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter new label"
        />
        <button className="button-confirm" onClick={handleSubmit}>
          Confirm
        </button>
        <button className="button-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PopupAxisLable;
