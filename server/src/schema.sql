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