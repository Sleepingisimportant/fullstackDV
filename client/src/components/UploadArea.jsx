import React, { useState } from "react";

function UploadArea({ isUploading }) {
  const [fileCapacity, setFileCapacity] = useState(null);
  const [fileTCV, setFileTCV] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const handleFileChange = (id, e) => {
    setUploadError(false);
    const file = e.target.files[0];
    if (file) {
      if (id === "fileCapacity") {
        setFileCapacity(file);
      } else {
        setFileTCV(file);
      }
    }
  };

  const handleUpload = async () => {
    if (fileCapacity && fileTCV) {
      setUploading(true);

      //announce uploading status when starting the file upload
      isUploading(true);

      //api - insert uploaded file
      const formData = new FormData();
      formData.append("fileCapacity", fileCapacity);
      formData.append("fileTCV", fileTCV);

      await fetch("http://localhost:3000/uploadFile", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          // Handle error response data

          if (!response.ok) {
            setUploadError(true);
            setUploading(false);
            isUploading(false);
            throw new Error("Uploading result was not ok");
          }
        })
        .then((data) => {
          console.log(data);
          setUploading(false);
          isUploading(false);

          window.location.reload();
        });
    }
  };

  return (
    <>
      {/* Show uploading gif and hide the upload fields during the file uploading */}
      {uploading ? (
        <div className="loading-indicator">
          <img src="https://i.gifer.com/ZKZg.gif" alt="Loading" />
        </div>
      ) : (
        <div className="area-upload">
          <div className="block-upload">
            <div className="block-subtitle">File Capacity</div>
            <label className="file-input-label">
              {fileCapacity == null
                ? "Click to upload a file ....."
                : "UPLOADED: " + fileCapacity.name}
              <input
                id="fileCapacity"
                type="file"
                onChange={(e) => handleFileChange("fileCapacity", e)}
              />
            </label>
          </div>
          <div className="block-upload">
            <div className="block-subtitle">File Current / Voltage</div>
            <label className="file-input-label">
              {fileTCV == null
                ? "Click to upload a file ....."
                : "UPLOADED: " + fileTCV.name}
              <input
                id="fileTCV"
                type="file"
                onChange={(e) => handleFileChange("fileTCV", e)}
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
          {uploadError ? (
            <div className="error-text">UPLOAD FAIL!! PLEASE TRY AGAIN!</div>
          ) : null}
        </div>
      )}
    </>
  );
}

export default UploadArea;
