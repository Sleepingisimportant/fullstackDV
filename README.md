# **Data Visualization Tool**

## **Version: 0.2**

- **0.2**:
  - improved load csv speed (from over 30 seconds to 1 second). Using LOAD DATA INFILE instead of inserting rows respectively.
  - improved upload file error handling, including
    - block users upload files from different test
    - force users to upload matched file type to the corresponding upload field
- **0.1**: 
   -  first commit, covers features including upload files, show line chart, pannable and zoomable chart, filter line, download chart

### **PROJECT GOAL**

The goal of this project is to develop a data analysis tool that visualizes data from large CSV files. The features and workflow are presented below.

### **TECHNICAL STRUCTURE**

- **Backend:** Utilizes Node.js and Express.js for building the backend.
- **Frontend:** Built with React (Vite), and the page is responsive to a certain degree.
- **Database**: MySQL

### **ASSUMPTION & RESTRICTION**

- It is assumed that users upload two CSV files, one contains capacity data, another contains current and voltage file. The two files belongs to the same battery test.

### **FEATURES**

1. **File Upload:**

   - If no file has been uploaded, no data will be shown, and all the filters and dropdowns will also be hidden. The Upload button will be activated when two files are uploaded. Once users click the button "UPLOAD," the loading gif will be shown, and other sections will be hidden.
   - Once the upload is finished, the charts below will show the latest uploaded file data.

   [![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/KacNl62ly2k/0.jpg)](https://www.youtube.com/watch?v=KacNl62ly2k)

   - If the uploaded files do not meet the expected format (thus, they cannot be successfully inserted into the database), an error message will appear on the screen. If the uploaded files are not from same test, the upload will fail and error message will be shown.

   [![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/7rv8G3TRo0s/0.jpg)](https://www.youtube.com/watch?v=7rv8G3TRo0s)

2. **Capacity Section:**

   - Users can find a line chart in this section, which presents the capacity data per cycle from the selected file. The default file is the latest uploaded file. Users can pan and zoom in-and-out of the graph (both x and y-axis).
   - The dropdown "CHOOSE FILE" lists all the uploaded files, including their name and upload time.

   [![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/C7I4jKKUH-c/0.jpg)](https://www.youtube.com/watch?v=C7I4jKKUH-c)

3. **Current/Voltage Section:**

   - Users can find a line chart in this section, which presents the voltage and current data based on the chosen file and the chosen cycle. The default cycle is CYCLE 1. Users can pan and zoom in-and-out of the graph (both x and y-axis).
   - The dropdown "CHOOSE CYCLE" lists all the cycles of the selected file.
   - A filter is provided for users to decide which line (current or voltage or both or none) to be shown in the chart.

   [![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/j8eSEoc5A04/0.jpg)](https://www.youtube.com/watch?v=j8eSEoc5A04)

4. **Download Chart:** Users can configure the chart and download it (including configuration).

   [![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/KoOus5dZF20/0.jpg)](https://www.youtube.com/watch?v=KoOus5dZF20)

### **PROJECT SETUP**

1. **Clone Project:** Clone the project from GitHub.

2. **Prepare MySQL Database:**

   - Start MySQL DB and create a database for the project.

   ```jsx
   CREATE DATABASE battery;
   ```

   - The schema for the table creation is as below. It can also be found at `fullstackDV/server/schema.sql`

   ```jsx
   -- Enable LOAD DATA LOCAL INFILE
   SET GLOBAL local_infile=true;

   USE battery;

   CREATE TABLE uploadedFile(
   fileID INTEGER PRIMARY KEY AUTO_INCREMENT,
   testName VARCHAR(100) NOT NULL,
   uploadTime TIMESTAMP NOT NULL DEFAULT NOW()
   );

   CREATE TABLE cycle_capacity(
   cycleNum INTEGER NOT NULL,
   capacity DECIMAL(20, 15) NOT NULL,
   cycleID INTEGER PRIMARY KEY AUTO_INCREMENT,
   fileID INTEGER NOT NULL,
   FOREIGN KEY (fileID) REFERENCES uploadedFile(fileID)
   );

   CREATE TABLE cycle_data(
   cycleNum INT NOT NULL,
   cycleTime DECIMAL(10, 1) NOT NULL,
   current DECIMAL(20, 15) NOT NULL,
   voltage DECIMAL(20, 15) NOT NULL,
   TCVID INTEGER PRIMARY KEY AUTO_INCREMENT,
   fileID INTEGER NOT NULL,
   FOREIGN KEY (fileID) REFERENCES uploadedFile(fileID)
   );
   ```



- Create a **`.env`** file in the root of the **`fullstackDV/server`** directory with the following content:

```

MYSQL_HOST='127.0.0.1'
MYSQL_USER='root'
MYSQL_PASSWORD='[Fill in your MySQL password]'
MYSQL_DATABASE='battery'

```

3. **Run Commands:**

```

cd fullstackDV/server
npm install
npm run dev

cd fullstackDV/client
npm install
npm run dev

```

4. **Access Project:** Click the link provided by Vite in the terminal. The project should now be running.

###

###


