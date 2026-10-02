const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
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

app.listen(3001, () => {
  console.log("Server running on port 3001");
});