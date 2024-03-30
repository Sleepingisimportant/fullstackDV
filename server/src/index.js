import express from "express";
import cors from "cors";
import multer from "multer";
import mysql from "mysql2";
import dotenv from "dotenv";

import fs from "fs/promises";
import { createReadStream } from "node:fs";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//handle uploaded file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mapping object for transforming filter notation
const notationMapping = {
  greater: ">",
  smaller: "<",
  greaterEqual: ">=",
  smallerEqual: "<=",
  equal: "=",
};

//database connection
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    flags: ["+LOCAL_FILES"],
  })
  .promise();

//API
app.get("/getFiles", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM uploadedFile");
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getCycleNum/:fileID", async (req, res) => {
  const fileID = req.params.fileID;
  try {
    const result = await pool.query(
      "SELECT cycleNum FROM cycle_capacity WHERE fileID=?",
      [fileID]
    );
    res.status(200).send(result[0]);
  } catch (error) {
    console.error("Error fetching cycle number:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getCapacity/:fileID/:capacityFilter?", async (req, res) => {
  const fileID = req.params.fileID;
  const capacityFilter = req.params.capacityFilter;
  let query = "SELECT * FROM cycle_capacity WHERE fileID=?";
  let queryParams = [fileID];
  let rows;
  try {
    if (capacityFilter.length > 0) {
      const filters = JSON.parse(capacityFilter); // Parse the JSON string to an array
      filters.forEach((filter, index) => {
        const transformedNotation = notationMapping[filter.notation];
        query += ` AND capacity ${transformedNotation} ?`;
        queryParams.push(filter.value);
      });
      [rows] = await pool.query(query, queryParams);
    } else {
      [rows] = await pool.query("SELECT * FROM cycle_capacity WHERE fileID=?", [
        fileID,
      ]);
    }

    res.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching capacity:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get(
  "/getTCV/:fileID/:cycleNum/:currentFilter?/:voltageFilter?",
  async (req, res) => {
    const fileID = req.params.fileID;
    const cycleNum = req.params.cycleNum;
    const currentFilter = req.params.currentFilter;
    const voltageFilter = req.params.voltageFilter;
    let rows;

    try {
      if (currentFilter.length == 0 && voltageFilter.length == 0) {
        [rows] = await pool.query(
          "SELECT * FROM cycle_data WHERE fileID=? AND cycleNum=?",
          [fileID, cycleNum]
        );
      } else {
        let query = "SELECT * FROM cycle_data WHERE fileID=? AND cycleNum=?";
        let queryParams = [fileID, cycleNum];
        let filterCurrent;
        let filterVoltage;
        currentFilter && (filterCurrent = JSON.parse(currentFilter));
        voltageFilter && (filterVoltage = JSON.parse(voltageFilter));

        voltageFilter &&
          currentFilter &&
          filterCurrent.forEach((filter, index) => {
            const transformedNotation = notationMapping[filter.notation];
            query += ` AND current ${transformedNotation} ?`;
            queryParams.push(filter.value);
          });

        filterVoltage.forEach((filter, index) => {
          const transformedNotation = notationMapping[filter.notation];
          query += ` AND voltage ${transformedNotation} ?`;
          queryParams.push(filter.value);
        });
        [rows] = await pool.query(query, queryParams);
      }

      res.status(200).send(rows);
    } catch (error) {
      console.error("Error fetching TCV:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/uploadFile",
  upload.fields([{ name: "fileCapacity" }, { name: "fileTCV" }]),
  async (req, res) => {
    try {
      const fileCapacity = req.files["fileCapacity"][0];
      const fileTCV = req.files["fileTCV"][0];
      const testName =
        req.files["fileCapacity"][0]["originalname"].match(/[^_]+_[^_]+/)[0];

      const uploadFile = await pool.query(
        "INSERT INTO uploadedFile (testName) VALUES (?)",
        [testName]
      );
      const fileID = uploadFile[0].insertId;

      // save the uploaded file to the backend
      const fileCapacityPath = path.join(__dirname, fileCapacity.originalname);
      await fs.writeFile(fileCapacityPath, fileCapacity.buffer);

      const fileTCVPath = path.join(__dirname, fileTCV.originalname);
      await fs.writeFile(fileTCVPath, fileTCV.buffer);

      // use LOAD DATA INFILE to insert file content into sql db
      const sqlLoadCapacity = `LOAD DATA LOCAL INFILE '${fileCapacityPath}' INTO TABLE cycle_capacity 
      FIELDS TERMINATED BY ',' 
      LINES TERMINATED BY '\n' 
      IGNORE 1 ROWS 
      (@cycle_num, capacity, cycleID, fileID)
      SET cycleNum = @cycle_num, fileID = '${fileID}'`;
      await pool.query({
        sql: sqlLoadCapacity,
        infileStreamFactory: () => createReadStream(fileCapacityPath),
      });

      const sqlLoadTCV = `
      LOAD DATA LOCAL INFILE '${fileTCVPath}' 
      INTO TABLE cycle_data 
      FIELDS TERMINATED BY ',' 
      LINES TERMINATED BY '\n' 
      IGNORE 1 ROWS
      (@cycle_num, @time, current, voltage, TCVID, fileID)
      SET cycleNum = @cycle_num, cycleTime = @time, fileID = '${fileID}'`;
      const result = await pool.query({
        sql: sqlLoadTCV,
        infileStreamFactory: () => createReadStream(fileTCVPath),
      });

      // delete the files in the directory
      await fs.unlink(fileCapacityPath);
      await fs.unlink(fileTCVPath);

      res.status(200).send({ ok: true });
    } catch (error) {
      await pool.query("DELETE FROM cycle_data WHERE fileID = ?", [fileID]);
      await pool.query("DELETE FROM cycle_capacity WHERE fileID = ?", [fileID]);
      await pool.query("DELETE FROM uploadedFile WHERE fileID = ?", [fileID]);
      console.error("Error uploading file:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
