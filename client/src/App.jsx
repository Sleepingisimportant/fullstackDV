import { useState } from "react";
import "./App.css";

//Component
import UploadArea from "./components/UploadArea";
import ChartCapacity from "./components/ChartCapacity";
import ChartTCV from "./components/ChartTCV";
import DropdownComponent from "./components/DropdownComponent";

function App() {
  const [selectedFileID, setSelectedFileID] = useState(null);
  const [selectedCycleNum, setSelectedCycleNum] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dataExist, setDataExist] = useState(false);
  const [filterCurrentVoltage, setFilterCurrentVoltage] = useState({
    Voltage: true,
    Current: true,
  });

  //handle the filter selection by user
  const handleFilterItemClick = (filterName) => {
    setFilterCurrentVoltage((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };

  return (
    <div className="dashboard ">
      <div className="dashboard-block ">
        <div className="block-title">Upload File</div>
        <UploadArea
          isUploading={(upload) => {
            console.log("Isuploading? :", upload);
            setIsUploading(upload);
          }}
        />
      </div>

      {/* During the file uploading, the area for charts will be hidden.  */}
      {!isUploading && (
        <>
          <div className="dashboard-block ">
            <div className="same-row-space-between">
              <div className="block-title">Capacity</div>
              <DropdownComponent
                api={"getFiles"}
                queryDataShow={1}
                dropdownText={"CHOOSE FILE:"}
                dropdownItemText={"FILE: "}
                onSelect={(select) => {
                  setSelectedFileID(select);
                }}
              />
            </div>
            <ChartCapacity
              selectedFileID={selectedFileID}
              dataExist={(d) => {
                setDataExist(d);
              }}
            />
          </div>
          <div className="dashboard-block">
            <div className="same-row-space-between">
              <div className="block-title"> Current / Voltage</div>
              <DropdownComponent
                selectedFileID={selectedFileID}
                api={`getCycleNum/${selectedFileID}`}
                queryDataShow={0}
                dropdownText={"CHOOSE CYCLE:"}
                dropdownItemText={"CYCLE "}
                onSelect={(select) => {
                  setSelectedCycleNum(select);
                }}
              />
            </div>
            {/* if no file in the database, then do not show filter */}
            {dataExist && (
              <>
                <div className="block-subtitle">Filter by legend</div>
                <div className="filter-area">
                  <div
                    className={`filter-item ${
                      !filterCurrentVoltage.Current && "disabled"
                    }`}
                    onClick={() => handleFilterItemClick("Current")}
                  >
                    Current
                  </div>
                  <div
                    className={`filter-item ${
                      !filterCurrentVoltage.Voltage && "disabled"
                    }`}
                    onClick={() => handleFilterItemClick("Voltage")}
                  >
                    Voltage
                  </div>
                </div>
              </>
            )}
            <ChartTCV
              selectedFileID={selectedFileID}
              selectedCycleNum={selectedCycleNum}
              filterCurrentVoltage={filterCurrentVoltage}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
