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

