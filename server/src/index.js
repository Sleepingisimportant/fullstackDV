import express from "express";
import cors from "cors";
import multer from "multer";
import pg from "pg";
import dotenv from "dotenv";


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
const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: true,
});

//API
app.get("/getFiles", async (req, res) => {
  try {
    const query = 'SELECT * FROM "uploadedFile"';
    const { rows } = await pool.query(query);
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getCycleNum/:fileID", async (req, res) => {
  const fileID = req.params.fileID;
  try {
    const query =
      'SELECT "cycleNum" FROM "cycle_capacity" WHERE "fileID"=$1 ORDER BY "cycleNum"';
    const { rows } = await pool.query(query, [fileID]);
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching cycle number:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getCapacity/:fileID/:capacityFilter?", async (req, res) => {
  const fileID = req.params.fileID;
  const capacityFilter = req.params.capacityFilter;
  let query = 'SELECT * FROM "cycle_capacity" WHERE "fileID"=$1';
  let queryParams = [parseInt(fileID)];

  try {
    if (capacityFilter.length > 0) {
      const filters = JSON.parse(capacityFilter);
      filters.forEach((filter, index) => {
        const transformedNotation = notationMapping[filter.notation];
        query += ` AND "capacity" ${transformedNotation} $${index + 2}`;
        queryParams.push(filter.value);
      });
    }
    query += ` ORDER BY "cycleNum"`;

    const { rows } = await pool.query(query, queryParams);

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

    let query;
    let queryParams = [fileID, cycleNum];

    let indexStatement = 2;

    query = 'SELECT * FROM "cycle_data" WHERE "fileID"=$1 AND "cycleNum"=$2';
    try {
      if (!(currentFilter.length == 0 && voltageFilter.length == 0)) {
        let filterCurrent;
        let filterVoltage;
        currentFilter && (filterCurrent = JSON.parse(currentFilter));
        voltageFilter && (filterVoltage = JSON.parse(voltageFilter));

        voltageFilter &&
          currentFilter &&
          filterCurrent.forEach((filter, index) => {
            indexStatement += 1;
            const transformedNotation = notationMapping[filter.notation];
            query += ` AND "current" ${transformedNotation} $${indexStatement}`;
            queryParams.push(filter.value);
          });

        filterVoltage.forEach((filter, index) => {
          indexStatement += 1;
          const transformedNotation = notationMapping[filter.notation];
          query += ` AND "voltage" ${transformedNotation} $${indexStatement}`;
          queryParams.push(filter.value);
        });
      }
      query += ` ORDER BY "cycleTime" `;

      const { rows } = await pool.query(query, queryParams);

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
      const testName = fileCapacity.originalname.match(/[^_]+_[^_]+/)[0];

      // Insert a record into the uploadedFile table and retrieve the fileID
      const uploadFileResult = await pool.query(
        'INSERT INTO "uploadedFile" ("testName") VALUES ($1) RETURNING "fileID"',
        [testName]
      );
      const fileID = uploadFileResult.rows[0].fileID;
      // Read file contents
      const capacityData = fileCapacity.buffer
        .toString("utf8")
        .trim()
        .split("\n")
        .slice(1)
        .map((line) => line.split(","));
      const tcvData = fileTCV.buffer
        .toString("utf8")
        .trim()
        .split("\n")
        .slice(1)
        .map((line) => line.split(","));

      // Insert data into cycle_capacity table
      await Promise.all(
        capacityData.map(async (row) => {
          const queryString =
            'INSERT INTO "cycle_capacity" ("cycleNum", "capacity", "fileID") VALUES ($1, $2, $3)';
          await pool.query(queryString, [row[0], row[1], fileID]);
        })
      );
      console.log("insert Capacity");

      // Insert data into cycle_data table
      await Promise.all(
        tcvData.map(async (row) => {
          const queryString =
            'INSERT INTO "cycle_data" ("cycleNum", "cycleTime", "current", "voltage", "fileID") VALUES ($1, $2, $3, $4, $5)';
          await pool.query(queryString, [
            row[0],
            row[1],
            row[2],
            row[3],
            fileID,
          ]);
        })
      );
      console.log("insert TCV");

      

      res.status(200).send({ ok: true });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
