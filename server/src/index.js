import express from "express";
import cors from "cors";
import multer from "multer";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//handle uploaded file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//database connection
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
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

app.get("/getCapacity/:fileID", async (req, res) => {
  const fileID = req.params.fileID;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM cycle_capacity WHERE fileID=?",
      [fileID]
    );
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching capacity:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getTCV/:fileID/:cycleNum", async (req, res) => {
  const fileID = req.params.fileID;
  const cycleNum = req.params.cycleNum;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM cycle_data WHERE fileID=? AND cycleNum=?",
      [fileID, cycleNum]
    );
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching TCV:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post(
  "/uploadFile",
  upload.fields([{ name: "fileCapacity" }, { name: "fileTCV" }]),
  async (req, res) => {
    const fileName = req.files["fileCapacity"][0]["originalname"];
    const fileCapacity = req.files["fileCapacity"][0];
    const fileTCV = req.files["fileTCV"][0];

    const fileCapacityContent = fileCapacity.buffer
      .toString("utf8")
      .split("\n");
    const fileTCVContent = fileTCV.buffer.toString("utf8").split("\n");

    let fileID;
    try {
      const typeNum = fileName.match(/[^_]+_[^_]+/)[0];
      const uploadFile = await pool.query(
        "INSERT INTO uploadedFile (typeNum) VALUES (?)",
        [typeNum]
      );
      fileID = uploadFile[0].insertId;

      for (let i = 1; i < fileCapacityContent.length - 1; i++) {
        const line = fileCapacityContent[i];
        const [cycleNum, capacity] = line.split(",");
        const sqlCapacity =
          "INSERT INTO cycle_capacity (capacity, cycleNum, fileID) VALUES (?, ?, ?)";
        await pool.query(sqlCapacity, [capacity, cycleNum, fileID]);
      }
      console.log("Capacity INSERTED!");

      for (let i = 1; i < fileTCVContent.length - 1; i++) {
        const line = fileTCVContent[i];
        const [cycleNum, cycleTime, current, voltage] = line.split(",");

        const sqlTCV =
          "INSERT INTO cycle_data (cycleTime, current, voltage, fileID, cycleNum) VALUES (?, ?, ?, ?, ?)";
        await pool.query(sqlTCV, [
          cycleTime,
          current,
          voltage,
          fileID,
          cycleNum,
        ]);
      }
      console.log("TCV INSERTED!");

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
