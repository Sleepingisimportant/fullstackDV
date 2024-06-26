import React, { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import hosting from "./hosting";

function ComponentDropdown({
  onSelect: onSelect,
  api: api,
  dropdownText: dropdownText,
  dropdownItemText: dropdownItemText,
  selectedFileID = null,
  queryDataShow: queryDataShow,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch(`${hosting}/${api}`)
          .then((response) => {
            if (response.status !== 200) {
              throw new Error("Fetch data fail!");
            }
            return response.json();
          })
          .then((data) => {
            if (data.length > 0) {
              api == "getFiles" ? setData(data.reverse()) : setData(data);
              if (selectedItem === null) {
                const defaultSelected = data[0];

                setSelectedItem(defaultSelected);
                onSelect(Object.values(defaultSelected));
              }
            }
          
            return data;
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  
    

  }, [selectedFileID]);


  function handleSelect(selected) {
    setSelectedItem(selected);
    onSelect(Object.values(selected));
  }

  return (
    <div className="dropdown">
      {data && selectedItem && (
        <Dropdown>
          <Dropdown.Toggle
            style={{
              fontSize: "1vw",
              backgroundColor: "white",
              color: " rgb(66, 66, 66)",
              borderColor: "white",
              borderRadius: "0px",
            }}
          >
            {dropdownText}{" "}
            <span style={{ fontWeight: "bold" }}>{` ${
              Object.values(selectedItem)[queryDataShow]
            }`}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="scrollable-menu">
            {data.map((d, index) => (
              <Dropdown.Item
                key={Object.values(d)}
                onClick={() => handleSelect(d)}
              >
                {`${dropdownItemText} ${Object.values(d)[queryDataShow]}`}
                {/* for dropdown file-select to display extra upload time */}
                {Object.values(d)[2] && (
                  <div className="note">
                    {Object.values(d)[2].slice(0, 19).replace("T", " ")}
                  </div>
                )}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}

export default ComponentDropdown;
