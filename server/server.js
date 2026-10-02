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
  if (search) {
    const sql =
      `SELECT * FROM opportunities WHERE title LIKE '%${search}%'`;
    db.query(sql, (error, results) => {
      if (error) {
        res.status(500).json({ error: "Failed to get opportunities" });
      } else {
        res.json(results);
      }
    });
  } else {
    db.query("SELECT * FROM opportunities", (error, results) => {
      if (error) {
        res.status(500).json({ error: "Failed to get opportunities" });
      } else {
        res.json(results);
      }
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});