import React, { useEffect, useState } from "react";
import hosting from "./hosting";

function UploadArea({ isUploading }) {
  const [fileCapacity, setFileCapacity] = useState(null);
  const [fileTCV, setFileTCV] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [progress, setProgress] = useState(0.0);

  const errorMsgFileTypeInconsistency = "WRONG FILE TYPE!! PLEASE TRY AGAIN!";
  const errorMsgFileTestNumInconsistency =
    "UPLOADED FILES ARE FROM DIFFERENT TESTS. PLEASE TRY AGAIN!";

  useEffect(() => {
    if (uploading) {
      const eventSource = new EventSource(`${hosting}/progress`);

      // Event listener for progress updates
      eventSource.onmessage = (event) => {
        // Update the progress indicator
        setProgress(event.data);
      };

      // Event listener for error handling
      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
      };
    }
  }, [uploading]);

  const handleFileChange = (e) => {
    setUploadError(null);
    const file = e.target.files[0];
    const fileName = file["name"];
    const fileType =
      fileName.match(/(?:[^_]+_){2}([^_]+)/)[1] == "capacity"
        ? "fileCapacity"
        : "fileTCV";
    const uploadedField = e.target.id;

    //If uploaded file doesnt match the field
    if (fileType != uploadedField) {
      setUploadError(errorMsgFileTypeInconsistency);
      uploadedField == "fileCapacity"
        ? setFileCapacity(null)
        : setFileTCV(null);
      return;
    } else {
      setUploadError(null);
      uploadedField == "fileCapacity"
        ? setFileCapacity(file)
        : setFileTCV(file);
    }
  };

  const handleUpload = async () => {
    //if both uploaded files do not come from same test, then show error message
    if (
      fileCapacity["name"].match(/[^_]+_[^_]+/)[0] !=
      fileTCV["name"].match(/[^_]+_[^_]+/)[0]
    ) {
      setUploadError(errorMsgFileTestNumInconsistency);
      return;
    }
    if (fileCapacity && fileTCV) {
      setUploading(true);

      //announce uploading status when starting the file upload
      isUploading(true);

      //api - insert uploaded file
      const formData = new FormData();
      formData.append("fileCapacity", fileCapacity);
      formData.append("fileTCV", fileTCV);

      await fetch(`${hosting}/uploadFile`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            setUploadError("SOMETHING WRONG. PLEASE RELOAD THE PAGE.");
            setUploading(false);
            isUploading(false);
            throw new Error("Uploading result was not ok");
          }
        })
        .then((data) => {
          setUploading(false);
          isUploading(false);

          // window.location.reload();
        });
    }
  };

  return (
    <>
      {/* Show uploading gif and hide the upload fields during the file uploading */}
      {uploading ? (
        <>
          <div className="loading-indicator">
            <img src="https://i.gifer.com/ZKZg.gif" alt="Loading" />
          <div className="block-subtitle"> {progress} %</div>
          </div>
        </>
      ) : (
        <div className="area-upload">
          <div className="block-upload">
            <div className="block-subtitle">File Capacity</div>
            <label className="file-input-label">
              {fileCapacity == null
                ? "Click to upload a file ....."
                : fileCapacity.name}
              <input
                id="fileCapacity"
                type="file"
                onChange={(e) => handleFileChange(e)}
              />
            </label>
          </div>
          <div className="block-upload">
            <div className="block-subtitle">File Current / Voltage</div>
            <label className="file-input-label">
              {fileTCV == null ? "Click to upload a file ....." : fileTCV.name}
              <input
                id="fileTCV"
                type="file"
                onChange={(e) => handleFileChange(e)}
              />
            </label>
          </div>
          <div className="button-container">
            <div
              className={`button ${(!fileCapacity || !fileTCV) && "disabled"}`}
              onClick={!fileCapacity || !fileTCV ? null : handleUpload}
            >
              UPLOAD
            </div>
          </div>
          {uploadError ? <div className="error-text">{uploadError}</div> : null}
        </div>
      )}
    </>
  );
}

export default UploadArea;
