# **Data Visualization Tool**

## **Version: 1.0**
- **1.0**:
   - add features: 
      - edit axis label, legend color
      - change chart type (line, scatter)
      - change plot parameter, data filtering
- **0.3**:
   -  deployed the solution on netifly (front) and render(server)
- **0.2**:
  - improved load csv speed (from over 30 seconds to 1 second). Using LOAD DATA INFILE instead of inserting rows respectively.
  - improved upload file error handling, including
    - block users upload files from different test
    - force users to upload matched file type to the corresponding upload field
- **0.1**: 
   -  first commit, covers features including upload files, show line chart, pannable and zoomable chart, filter line, download chart

### **PROJECT GOAL**

The goal of this project is to develop a data analysis tool that visualizes data from large CSV files. The features and workflow are presented below.

### **DEPLOYMENT**
- URL: https://fullstackdv.netlify.app/

### **VIDEO SHOWCASE**

[![Watch the video](https://img.youtube.com/vi/JYviuRHKjyo/maxresdefault.jpg)](http://www.youtube.com/watch?v=JYviuRHKjyo "Version 1.0")

### **TECHNICAL STRUCTURE**

- **Backend:** Utilizes Node.js and Express.js for building the backend.
- **Frontend:** Built with React (Vite), and the page is responsive to a certain degree.
- **Database**: MySQL 
- **DEPLOYMENT**: 
   - **Backend:**  Render
   - **Frontend:** Netilify
   - **Database**: freemysqlhosting.net


### **ASSUMPTION & RESTRICTION**

- It is assumed that users upload two CSV files, one contains capacity data, another contains current and voltage file. The two files belongs to the same battery test.

### **WORKFLOW**

1. **File Upload:**

   - If no file has been uploaded, no data will be shown, and all the filters and dropdowns will also be hidden. The Upload button will be activated when two files are uploaded. Once users click the button "UPLOAD," the loading gif will be shown, and other sections will be hidden.
   - Once the upload is finished, the charts below will show the latest uploaded file data.


   - If the uploaded files do not meet the expected format (thus, they cannot be successfully inserted into the database), an error message will appear on the screen. If the uploaded files are not from same test, the upload will fail and error message will be shown.


2. **Capacity Section:**

   - Users can find a line chart in this section, which presents the capacity data per cycle from the selected file. The default file is the latest uploaded file. Users can pan and zoom in-and-out of the graph (both x and y-axis).
   - The dropdown "CHOOSE FILE" lists all the uploaded files, including their name and upload time.
   - User can change color of the legend and edit the axis label name.
   - Users can select either line chart or scatter chart. (Default: Line chart)
   - Users can add conditions to filter the capacity data. **If the condition leads to no data shown, the condition will NOT be established.** (Default: No condition)
   - Users can configure the chart and download it (including configuration).


3. **Current/Voltage Section:**

   - Users can find a line chart in this section, which presents the voltage and current data based on the chosen file and the chosen cycle. The default cycle is CYCLE 1. Users can pan and zoom in-and-out of the graph (both x and y-axis).
   - The dropdown "CHOOSE CYCLE" lists all the cycles of the selected file.
   - User can change color of the legend and edit the axis label name.
   - Users can select either line chart or scatter chart. (Default: Line chart)
   - Users can select to show Voltage or Current or both. If Current is not being selected, then filter by current data is also hidden. Same applies to Voltage. (Default: Both)
   - Users can add conditions to filter the current and voltage data. **If the condition leads to no data shown, the condition will NOT be established.** (Default: No condition)
   - Users can configure the chart and download it (including configuration).

