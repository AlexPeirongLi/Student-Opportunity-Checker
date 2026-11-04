// STEP 1: load secrets from .env before anything reads process.env.
// TODO:
//   1. npm install dotenv
//   2. Copy .env.example to .env and paste in your Adzuna app_id and app_key
//   3. Uncomment the line below
//   4. Move the DB password below into .env too and use process.env.DB_PASSWORD

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { searchAdzuna, toOpportunity } = require("./adzuna");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "opportunity_tracker",
  port: 3307,
  dateStrings: true,
});

db.connect((error) => {
  if (error) {
    console.log("Database connection failed");
    console.log(error);
  } else {
    console.log("Connected to MySQL");
  }
});

app.get("/opportunities", (req, res) => {
  const search = req.query.search;
  const type = req.query.type;
  const location = req.query.location;
  let sql = "SELECT * FROM opportunities";

  if (search && type && location) {
    sql = `SELECT * FROM opportunities WHERE title LIKE '%${search}%' AND type = '${type}' AND location = '${location}'`;
  } else if (search && type) {
    sql = `SELECT * FROM opportunities WHERE title LIKE '%${search}%' AND type = '${type}'`;
  } else if (search && location) {
    sql = `SELECT * FROM opportunities WHERE title LIKE '%${search}%' AND location = '${location}'`;
  } else if (type && location) {
    sql = `SELECT * FROM opportunities WHERE type = '${type}' AND location = '${location}'`;
  } else if (search) {
    sql = `SELECT * FROM opportunities WHERE title LIKE '%${search}%'`;
  } else if (type) {
    sql = `SELECT * FROM opportunities WHERE type = '${type}'`;
  } else if (location) {
    sql = `SELECT * FROM opportunities WHERE location = '${location}'`;
  }

  db.query(sql, (error, results) => {
    if (error) {
      res.status(500).json({ error: "Failed to get opportunities" });
    } else {
      res.json(results);
    }
  });
});

app.post("/opportunities", (req, res) => {
  const title = req.body.title;
  const type = req.body.type;
  const location = req.body.location;
  const eligibility = req.body.eligibility;
  const deadline = req.body.deadline;
  const sql = `
    INSERT INTO opportunities
    (title, type, location, eligibility, deadline, status)
    VALUES
    ('${title}', '${type}', '${location}', '${eligibility}', '${deadline}', 'Not Applied')
  `;
  db.query(sql, (error) => {
    if (error) {
      res.status(500).json({ error: "Failed to add opportunity" });
    } else {
      res.json({ message: "Opportunity added" });
    }
  });
});

app.put("/opportunities/:id/status", (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  const sql =
    `UPDATE opportunities SET status = '${status}' WHERE id = ${id}`;

  db.query(sql, (error) => {
    if (error) {
      res.status(500).json({ error: "Failed to update status" });
    } else {
      res.json({ message: "Status updated" });
    }
  });
});

app.get("/adzuna/search", async (req, res) => {
  const what = req.query.what;
  const where = req.query.where;
  if (!what) {
    return res.status(400).json({ error: "Please give a search term (what)" });
  }
  try {
    const jobs = await searchAdzuna({"what": what,"where": where });
    res.json(jobs.map(toOpportunity));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to search Adzuna" });
  }
});

app.post("/opportunities/import", (req, res) => {
  const opportunities = req.body.opportunities;
  if (!Array.isArray(opportunities) || opportunities.length === 0) {
    return res.status(400).json({ error: "Send a non-empty opportunities array" });
  }

  const rows = opportunities.map((o) => [
    o.title,
    o.type,
    o.location,
    o.eligibility,
    o.deadline,
    "Not Applied",
    o.source,
    o.external_id,
    o.url,
    o.posted_date,
  ]);

  const sql = `INSERT IGNORE INTO opportunities
    (title, type, location, eligibility, deadline, status, source, external_id, url, posted_date)
    VALUES ?`;
  db.query(sql, [rows], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to import opportunities" });
    } else {
      res.json({ added: results.affectedRows });
    }
  });
});

// STEP 8 is in App.tsx (show the url as an "Apply" link and credit Adzuna).
// Also: the SELECT in GET /opportunities uses SELECT *, so the new columns come back automatically.

app.listen(3001, () => {
  console.log("Server running on port 3001");
});