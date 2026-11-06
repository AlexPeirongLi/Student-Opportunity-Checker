const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "opportunity_tracker",
  port: 3307,
  dateStrings: true,
});

const db = pool.promise();
module.exports = db;
