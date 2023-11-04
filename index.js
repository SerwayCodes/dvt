const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const flash = require("express-flash");
const session = require("express-session");

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

// Middleware setup
app.use(
  session({ secret: process.env.SECRET, resave: true, saveUninitialized: true })
);
app.use(flash());

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/login", async (req, res) => {
  res.render("login.ejs");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  pool.query(
    "SELECT * FROM users WHERE username = $1 AND password = $2",
    [username, password],
    (error, result) => {
      if (error) {
        console.error(error);
        res.redirect("/?error=1");
      } else {
        if (result.rows.length > 0) {
          req.session.user = result.rows[0];
          res.redirect("/patient_list");
        } else {
          req.flash("error", "Wrong Username or Password!");
          res.redirect("/login");
        }
      }
    }
  );
});

app.get("/logout", async (req, res) => {
  res.render("index");
});

app.get("/patient_list", async (req, res) => {
  const result = await pool.query("SELECT * FROM patients");
  const patients = result.rows;

  res.render("patient_list", { patients });
});

app.get("/bar-type", async (req, res) => {
  try {
    const patientId = parseInt(req.query.id);

    // Retrieve patient data from the database and render patient_data.ejs
    const result = await pool.query(
      "SELECT * FROM patients WHERE patientid = $1",
      [patientId]
    );
    const patient = result.rows;

    res.render("bar", { patient: patient });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).send("Internal Server Error");
  }
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

    const patientId = 2;
    if (result.rows.length > 0) {
      // Update the last processed row ID
      lastProcessedRowId = result.rows[0].id;

      // Extract the data
      const { hr, resp, spo2 } = result.rows[0];

      // Insert data into the history table with the current timestamp
      const currentTime = new Date();
      await pool.query(
        "INSERT INTO history (patient_id, timeinstant, hr, resp, spo2) VALUES ($1, $2, $3, $4, $5)",
        [patientId, currentTime, hr, resp, spo2]
      );

      // Send the retrieved data as JSON response
      res.json({ hr, resp, spo2 });
    } else {
      // No more rows to process, send an empty response
      res.json({ hr: null });
    }
  } catch (error) {
    console.error("Error fetching and inserting chart data:", error);
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
  try {
    const patientId = parseInt(req.query.id);

    // Retrieve patient data from the database and render patient_data.ejs
    const result = await pool.query(
      "SELECT * FROM patients WHERE patientid = $1",
      [patientId]
    );
    const patient = result.rows;

    res.render("patient_data", { patient: patient });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).send("Internal Server Error");
  }
});

//===================================================================================================
app.get("/add_review", async (req, res) => {
  try {
    const patientId = parseInt(req.query.id);

    // Retrieve patient data from the database and render patient_data.ejs
    const result = await pool.query(
      "SELECT * FROM patients WHERE patientid = $1",
      [patientId]
    );
    const patient = result.rows;

    res.render("add_review.ejs", { patient: patient });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/patient_review", async (req, res) => {
  try {
    const patientId = parseInt(req.query.id);

    // Retrieve patient and review data by joining patients and reviews tables
    const query = {
      text: "SELECT patients.patientid, patients.patientname, reviews.dateofreview, reviews.generalcondition, reviews.treatmentplan, reviews.observations, reviews.followuprecommendations, reviews.timeofreview FROM patients LEFT JOIN reviews ON patients.patientid = reviews.patientid WHERE patients.patientid = $1",
      values: [patientId],
    };

    const result = await pool.query(query);
    const patientReviews = result.rows;

    res.render("reviews.ejs", { patient: patientReviews });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add_review", async (req, res) => {
  const patientId = parseInt(req.query.id);
  const {
    timeOfReview,
    dateOfReview,
    generalCondition,
    treatmentPlan,
    observations,
    followUpRecommendations,
  } = req.body;

  try {
    // Update patient review data
    const updateQuery = {
      text: "UPDATE public.patients SET observations=$1, dateofreview=$2, timeofreview=$3, generalcondition=$4, treatmentplan=$5, followuprecommendations=$6 WHERE patientid=$7;",
      values: [
        observations,
        dateOfReview,
        timeOfReview,
        generalCondition,
        treatmentPlan,
        followUpRecommendations,
        patientId,
      ],
    };
    await pool.query(updateQuery);

    // Insert review data into the reviews table
    const insertQuery = {
      text: "INSERT INTO public.reviews (patientid, dateofreview, timeofreview, generalcondition, treatmentplan, observations, followuprecommendations) VALUES ($1, $2, $3, $4, $5, $6, $7);",
      values: [
        patientId,
        dateOfReview,
        timeOfReview,
        generalCondition,
        treatmentPlan,
        observations,
        followUpRecommendations,
      ],
    };
    await pool.query(insertQuery);

    req.flash("success", "Review added successfully");
    res.redirect(`/add_review?id=${patientId}`);
  } catch (error) {
    console.error("Error adding review:", error);
    req.flash("error", "Operation failed");
    res.redirect(`/add_review?id=${patientId}`);
  }
});

//history
app.get("/history", async (req, res) => {
  try {
    const patientId = parseInt(req.query.id);

    // Retrieve patient data from the database and render patient_data.ejs
    const result = await pool.query(
      "SELECT * FROM patients WHERE patientid = $1",
      [patientId]
    );
    const patient = result.rows;

    res.render("history.ejs", { patient: patient });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).send("Internal Server Error");
  }
 
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
