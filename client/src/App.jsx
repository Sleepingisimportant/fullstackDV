import { useState } from "react";
import "./App.css";

//Component
import UploadArea from "./components/UploadArea";
import ChartCapacity from "./components/ChartCapacity";
import ChartTCV from "./components/ChartTCV";
import ComponentDropdown from "./components/ComponentDropdown";

function App() {
  const [selectedFileID, setSelectedFileID] = useState(null);
  const [selectedCycleNum, setSelectedCycleNum] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dataExist, setDataExist] = useState(false);

  return (
    <div className="dashboard">
      {/* SECTION - UPLOAD FILE */}
      <div className="dashboard-block">
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
          {/* SECTION - CAPACITY */}
          <div className="dashboard-block ">
            <div className="same-row-space-between">
              <div className="block-title">Capacity</div>
              <ComponentDropdown
                api={"getFiles"}
                queryDataShow={1}
                dropdownText={"CHOOSE FILE:"}
                dropdownItemText={"FILE: "}
                onSelect={(select) => {
                  const selectedFileID=select[0];
                  setSelectedFileID(selectedFileID);
                }}
              />
            </div>
            <ChartCapacity selectedFileID={selectedFileID} />
          </div>

          {/* SECTION - CURRENT/VOLTAGE */}
          <div className="dashboard-block">
            <div className="same-row-space-between">
              <div className="block-title"> Current / Voltage</div>
             {selectedFileID&&<ComponentDropdown
                selectedFileID={selectedFileID}
                api={`getCycleNum/${selectedFileID}`}
                queryDataShow={0}
                dropdownText={"CHOOSE CYCLE:"}
                dropdownItemText={"CYCLE "}
                onSelect={(select) => {
                  const selectedCycleNum=select[0];
                  setSelectedCycleNum(selectedCycleNum);

                }}
              />}
            </div>
            <ChartTCV
              selectedFileID={selectedFileID}
              selectedCycleNum={selectedCycleNum}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
