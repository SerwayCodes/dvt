const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

const app = express();
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/patient_list", async (req, res) => {
  // Retrieve patient list data from the database and render patient_list.ejs
  // Example: const patients = await pool.query('SELECT * FROM patients');
  res.render("patient_list");
});


app.get("/bar-type", async (req, res) => {
  
  res.render("bar");
});

// Import necessary modules and setup your Express app and database connection

let lastProcessedRowId = 0;

app.get("/api/chart-data", async (req, res) => {
  try {
    // Fetch the next row from the database
    const result = await pool.query(
      "SELECT hr,resp,spo2, id FROM human_vitals WHERE id > $1 ORDER BY id ASC LIMIT 1",
      [lastProcessedRowId]
    );

    if (result.rows.length > 0) {
      // Update the last processed row ID
      lastProcessedRowId = result.rows[0].id;

      // Extract the heart rate data
      const hr = result.rows[0].hr;
        const resp = result.rows[0].resp;
        const spo2= result.rows[0].spo2;
      // Send the data as JSON
      console.log(hr,resp,spo2);
      res.json({ hr,resp,spo2 });
    } else {
      // No more rows to process, send an empty response
      res.json({ hr: null });
    }
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/prefetch-chart-data", async (req, res) => {
  try {
    // Fetch the next 100 rows from the database
    const result = await pool.query(
      "SELECT hr, resp,spo2, id FROM human_vitals WHERE id > $1 ORDER BY id ASC LIMIT 100",
      [lastProcessedRowId]
    );

    // Update the last processed row ID
    if (result.rows.length > 0) {
      lastProcessedRowId = result.rows[result.rows.length - 1].id;

      // Send the data as JSON
      res.json(result.rows);
    } else {
      // No more rows to process, send an empty response
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching prefetched chart data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/patient_data", async (req, res) => {
  // Retrieve patient data from the database and render patient_data.ejs
  // Example: const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
  res.render("patient_data");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
