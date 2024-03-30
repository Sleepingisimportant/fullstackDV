import React, { useState } from "react";

function PopupLegendColor({ onClose, onSubmit }) {
  const [selectedColor, setSelectedColor] = useState(""); // Initialize selected color state

  const handleSubmit = () => {
    // Pass both the new label and selected color to the onSubmit function
    onSubmit(selectedColor);
    onClose();
  };

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  return (
    <div className={`popup`}>
      <div className="popup-inner">
        <div className="block-subtitle">CHOOSE COLOR</div>
        <select
          id="label-color-dropdown"
          name="label-color"
          onChange={handleColorChange}
          value={selectedColor}
        >
          <option value="green">Green</option>
          <option value="orange">Orange</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="grey">Grey</option>
          <option value="yellow">Yellow</option>
          <option value="pink">Pink</option>
          <option value="purple">Purple</option>
          <option value="black">Black</option>
        </select>
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

export default PopupLegendColor;
