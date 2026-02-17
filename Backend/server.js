const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

// -----------------------------------------------------------
// FEATURE FLAG
//  if true, uses MySQL will be used. If false, uses SQLite.
const USE_MYSQL = true;

// This is a simple way to switch between databases for 
// testing and demonstration purposes.
// -----------------------------------------------------------

app.use(cors());

const sqliteDb = new sqlite3.Database("../database/crime_data.db", err => {
  if (err) console.error("SQLite error:", err.message);
  else console.log("Connected to SQLite");
});


// MySQL 
// this would typically be in a separate config file and use environment variables for credentials
const mysqlPool = mysql.createPool({
  host: "127.0.0.1",
  user: "dbuser",
  password: "dbpassword",
  database: "shooting_db",
  waitForConnections: true,
  connectionLimit: 10
});

// DB Adapter

const db = {
  query: async (sql, params = []) => {
    if (USE_MYSQL) {
      const [rows] = await mysqlPool.execute(sql, params);
      return rows;
    }

    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};


// ROUTES

// Total incidents
app.get("/totalincidents", async (req, res) => {
  try {
    console.log(`Using ${USE_MYSQL ? "MySQL" : "SQLite"} for /totalincidents`);

    const sql = USE_MYSQL
      ? `
        my sql query here
      `
      : `
        SELECT strftime('%Y', Date) AS year, COUNT(*) AS total_shootings
        FROM CaseInfo
        GROUP BY year
        ORDER BY year;
      `;

    const rows = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Shooting type KPI
app.get("/shootingtype", async (req, res) => {
  try {
    console.log(`Using ${USE_MYSQL ? "MySQL" : "SQLite"} for /shootingtype`);

    const sql = USE_MYSQL
      ? `
        mysql query here
      `
      : `
        SELECT strftime('%Y', Date) AS year, Crime_Type, COUNT(*) AS total_shootings
        FROM CaseInfo
        GROUP BY year, Crime_Type
        ORDER BY year, Crime_Type;
      `;

    const rows = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/shootingsbymonth", async (req, res) => {
  try {
    console.log(`Using ${USE_MYSQL ? "MySQL" : "SQLite"} for /shootingsbymonth`);

    const { crime_type } = req.query;

    const sql = USE_MYSQL
      ? `
        mysql query here
      `
      : `
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
    const rows = await db.query(sql, params);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/neighborhood-breakdown", async (req, res) => {
  try {
    const year = req.query.year;
    if (!year) return res.status(400).json({ error: "Year required" });

    console.log(`Using ${USE_MYSQL ? "MySQL" : "SQLite"} for /neighborhood-breakdown`);

    const sql = USE_MYSQL
      ? `
        mysql query here
      `
      : `
        SELECT
          strftime('%Y', c.Date) AS year,
          a.Neighborhood AS neighborhood,
          SUM(CASE WHEN c.Crime_Type = 'Non-Fatal Shooting' THEN 1 ELSE 0 END) AS Injured,
          SUM(CASE WHEN c.Crime_Type = 'Homicide' THEN 1 ELSE 0 END) AS Fatal,
          SUM(CASE WHEN c.Crime_Type = 'Shotspotter Alert' THEN 1 ELSE 0 END) AS AI
        FROM CaseInfo c
        LEFT JOIN Address a ON c.ObjectId = a.ObjectId
        WHERE strftime('%Y', c.Date) = ?
        GROUP BY year, neighborhood
        ORDER BY neighborhood;
      `;

    const rows = await db.query(sql, [year]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/shootingsmap", async (req, res) => {
  try {
    const { year, crime_type } = req.query;
    if (!year) return res.status(400).json({ error: "Year required" });

    console.log(`Using ${USE_MYSQL ? "MySQL" : "SQLite"} for /shootingsmap`);

    let sql = USE_MYSQL
      ? `
        mysql query here
      `
      : `
        SELECT c.Date AS date,
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

    const rows = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Neighborhoods impacted
app.get("/neighborhoods", async (req, res) => {
  try {
    console.log(`Using ${USE_MYSQL ? "MySQL" : "SQLite"} for /neighborhoods`);

    const sql = USE_MYSQL
      ? `
        mysql query here
      `
      : `
        SELECT strftime('%Y', c.Date) AS year,
               COUNT(DISTINCT a.Neighborhood) AS neighborhoods_impacted
        FROM CaseInfo c
        LEFT JOIN Address a ON c.ObjectId = a.ObjectId
        GROUP BY year
        ORDER BY year;
      `;

    const rows = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Shootings table
app.get("/shootings", async (req, res) => {
  try {
    const year = req.query.year;
    if (!year) return res.status(400).json({ error: "Year required" });

    console.log(`Using ${USE_MYSQL ? "MySQL" : "SQLite"} for /shootings`);

    const sql = USE_MYSQL
      ? `
        mysql query here
      `
      : `
        SELECT c.Date AS date,
               a.Address AS neighborhood,
               c.Crime_Type AS crime_type,
               c.ObjectId AS id
        FROM CaseInfo c
        LEFT JOIN Address a ON c.ObjectId = a.ObjectId
        WHERE strftime('%Y', c.Date) = ?
        ORDER BY c.Date DESC;
      `;

    const rows = await db.query(sql, [year]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//  START SERVER

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
