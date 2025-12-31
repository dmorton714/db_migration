const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;


app.use(cors());


// Connect to database
const db = new sqlite3.Database("../database/crime_data.db", err => {
  if (err) console.error("DB error:", err.message);
  else console.log("Connected to DB");
});


// Routes
app.get("/totalincidents", (req, res) => {
  const sql = `
    SELECT strftime('%Y', Date) AS year, COUNT(*) AS total_shootings
    FROM CaseInfo
    GROUP BY year
    ORDER BY year;
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// KPI Cards
app.get("/shootingtype", (req, res) => {
  const sql = `
    SELECT 
      strftime('%Y', Date) AS year,
      Crime_Type,
      COUNT(*) AS total_shootings
    FROM CaseInfo
    GROUP BY year, Crime_Type
    ORDER BY year, Crime_Type;
  `;

  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/neighborhoods", (req, res) => {
  const sql = `
    SELECT 
        strftime('%Y', c.Date) AS year,
        COUNT(DISTINCT a.Neighborhood) AS neighborhoods_impacted
    FROM CaseInfo c
    LEFT JOIN Address a
        ON c.ObjectId = a.ObjectId
    GROUP BY year
    ORDER BY year;
  `;

  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Table
app.get("/shootings", (req, res) => {
  const year = req.query.year; // e.g., ?year=2025
  if (!year) return res.status(400).json({ error: "Year query parameter is required" });

  const sql = `
    SELECT 
        c.Date AS date,
        a.Address AS neighborhood,
        c.Crime_Type AS crime_type,
        c.ObjectId AS id
    FROM CaseInfo c
    LEFT JOIN Address a
        ON c.ObjectId = a.ObjectId
    WHERE strftime('%Y', c.Date) = ?
    ORDER BY c.Date DESC;
  `;

  db.all(sql, [year], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// neighborhood breakdown
app.get("/neighborhood-breakdown", (req, res) => {
  const year = req.query.year;
  if (!year) return res.status(400).json({ error: "Year is required" });

  const sql = `
    SELECT
        strftime('%Y', c.Date) AS year,
        a.Neighborhood AS neighborhood,
        SUM(CASE WHEN c.Crime_Type = 'Non-Fatal Shooting' THEN 1 ELSE 0 END) AS Injured,
        SUM(CASE WHEN c.Crime_Type = 'Homicide' THEN 1 ELSE 0 END) AS Fatal,
        SUM(CASE WHEN c.Crime_Type = 'Shotspotter Alert' THEN 1 ELSE 0 END) AS AI
    FROM CaseInfo c
    LEFT JOIN Address a
        ON c.ObjectId = a.ObjectId
    WHERE strftime('%Y', c.Date) = ?
    GROUP BY year, neighborhood
    ORDER BY neighborhood;
  `;

  db.all(sql, [year], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// monthly groupby for plot
app.get("/shootingsbymonth", (req, res) => {
  const { crime_type } = req.query; // optional filter

  const sql = `
    SELECT
      strftime('%Y', Date) AS year,
      strftime('%m', Date) AS month,
      Crime_Type,
      COUNT(*) AS total_shootings
    FROM CaseInfo
    ${crime_type ? "WHERE Crime_Type = ?" : ""}
    GROUP BY year, month, Crime_Type
    ORDER BY year, month;
  `;

  const params = crime_type ? [crime_type] : [];

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// map plot
app.get("/shootingsmap", (req, res) => {
  const { year, crime_type } = req.query
  if (!year) return res.status(400).json({ error: "Year query parameter required" });

  let sql = `
    SELECT 
      c.Date AS date,
      a.Address AS neighborhood,
      c.Crime_Type AS crime_type,
      g.Latitude AS lat,
      g.Longitude AS lon,
      c.ObjectId AS id
    FROM CaseInfo c
    LEFT JOIN Address a ON c.ObjectId = a.ObjectId
    LEFT JOIN Geo g ON c.ObjectId = g.ObjectId
    WHERE strftime('%Y', c.Date) = ?
  `;

  const params = [year];

  if (crime_type) {
    sql += " AND c.Crime_Type = ?";
    params.push(crime_type);
  }

  sql += " ORDER BY c.Date DESC;";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
