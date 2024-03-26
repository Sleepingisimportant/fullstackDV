# **Data Visualization Tool**

## **Version:**

**0.1**

### **Goal**

The goal of this project is to develop a data analysis tool that visualizes data from large CSV files. The features and workflow are presented below.

### **Assumptions & Restrictions**

- It is assumed that users upload two CSV files, one contains capacity data, another contains current and voltage file. The two files belongs to the same battery test.
- The speed for uploading file is still to be refined.

### **Features**

1. **File Upload:** 
    1. If no file has been uploaded, no data will be shown. All the filters and dropdowns will also be hidden. Upload button will be activated when two files are uploaded. Once users click the button “UPLOAD”, the loading gif will be shown and other sections will be hidden. 
    2. Once upload is finished, the charts below shows the latest uploaded file data.
    3. If the uploaded files are not expected (thus, they cannot be successfully inserted into the database), then error message will pop up on the screen. The backend will make sure that the inserted data related to this fail-uploaded file will be all deleted.
    
    <iframe width="560" height="315" src="https://youtu.be/64r-5s0kreU" frameborder="0" allowfullscreen></iframe>
    
2. **Capacity Section:** 
    1. Users can find a line chart in this section, which present the capacity data per cycle from the selected file. The default file is the latest uploaded file. Users can zoom in and out of the graph (both x and y axis).
    2. Dropdown “CHOOSE FILE” lists all the uploaded files, including their name and upload time.
    
    <iframe width="560" height="315" src="https://youtu.be/C7I4jKKUH-c" frameborder="0" allowfullscreen></iframe>
    
3. **Current/Voltage Section:** 
    1. Users can find a line chart in this section, which present the voltage and current data based on the chosen file and the chosen cycle. The default cycle  is CYCLE 1. Users can zoom in and out of the graph (both x and y axis).
    2. Dropdown “CHOOSE CYCLE” lists all the cycle of the selected file. 
    3. Filter is provided for user to decide which line (current or voltage or both or none) to be shown in the chart.
    
    <iframe width="560" height="315" src="https://youtu.be/j8eSEoc5A04" frameborder="0" allowfullscreen></iframe>
    
4. **Download Chart:** Users can configure the chart and download the chart (including configuration) respectively.

<iframe width="560" height="315" src="https://youtu.be/KoOus5dZF20” frameborder="0" allowfullscreen></iframe>

### **Technical**

1. **Backend:** Utilizes Node.js and Express.js for building the backend.
2. **Frontend:** Built with React (Vite), and the page is responsive to a certain degree.
3. **Database**: MySQL

### **Project Setup**

1. **Clone Project:** Clone the project from GitHub.
2. **Prepare MySQL Database:**
    - Start MySQL DB and create a database for the project.
    - The schema for the tables creation is as below. It can also be found at**`fullstackDV/server/schema.sql`**
    
    ```jsx
    create table uploadedFile(
        fileID integer primary key auto_increment,
        typeNum text NOT NULL,
        uploadTime TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    create table cycle_capacity(
        cycleID integer primary key auto_increment,
        fileID integer NOT NULL,
        cycleNum integer NOT NULL,
        capacity DECIMAL(20, 15) NOT NULL,
        FOREIGN KEY (fileID) REFERENCES uploadedFile(fileID)
    );
    
    create table cycle_data(
        TCVID integer primary key auto_increment,
        cycleTime DECIMAL(10, 1) NOT NULL,
        current DECIMAL(20, 15) NOT NULL,
        voltage DECIMAL(20, 15) NOT NULL,
        fileID integer NOT NULL,
        cycleNum integer NOT NULL,
        FOREIGN KEY (fileID) REFERENCES uploadedFile(fileID)
    );
    ```
    
    - Create a **`.env`** file in the root of the **`fullstackDV/server`** directory with the following content:
    
    ```
    MYSQL_HOST='127.0.0.1'
    MYSQL_USER='root'
    MYSQL_PASSWORD='' // Fill in your MySQL password
    MYSQL_DATABASE='' // Fill in the database name you just created for the project
    ```
    
3. **Run Commands:**
    
    ```bash
    bashCopy code
    cd fullstackDV/server
    npm init
    npm run dev
    
    cd fullstackDV/client
    npm init
    npm run dev
    ```
    
4. **Access Project:** Click the link provided by Vite in the terminal. The project should now be running.

### 

###