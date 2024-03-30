import React, { useState } from "react";

function PopupFilterCondition({ filter, onClose, onSubmit }) {
  const [notation, setNotation] = useState("greater");
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    onSubmit(notation, inputValue);
    onClose();
  };

  const handleDataConditionAdd = (event) => {
    setNotation(event.target.value);
  };

  const handleInputChange = (event) => {
    let value = event.target.value;
    // Remove any non-numeric characters
    value = value.replace(/[^\d.]/g, "");
    setInputValue(value);
  };

  // const isInputValid = inputValue.trim() !== ""; // Check if input value is not empty

  return (
    <div className={`popup`}>
      <div className="popup-inner">
        <div className="block-subtitle">FILTER {filter}</div>
        <div></div>
        <select
          id="label-capacity-filter-dropdown"
          name="label-capacity-filter"
          onChange={handleDataConditionAdd}
          value={notation}
        >
          <option value="greater">&gt;</option>
          <option value="smaller">&lt;</option>
          <option value="greaterEqual">&gt;=</option>
          <option value="smallerEqual">&lt;=</option>
          <option value="equal">=</option>
        </select>
        <input
          type="text"
          placeholder="Number"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button
          className={`button-confirm  ${
            inputValue.trim() == 0 && "disabled"
          }`}
          onClick={handleSubmit}
          disabled={inputValue.trim()==0} // Disable Confirm button if input value is empty
        >
          Confirm
        </button>
        <button className="button-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PopupFilterCondition;
