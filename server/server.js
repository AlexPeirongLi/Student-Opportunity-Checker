require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const {isOpen} = require("./isOpen");
const {askAssistant} = require("./assistant");
const {STATUSES} = require("./lists");
const {checkEverything, isChecking, lastChecks} = require("./checks");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/opportunities", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM opportunities ORDER BY id DESC");
    for (const row of rows) {
      row.is_open = isOpen(row);
    }
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Failed to get opportunities"});
  }
});

app.put("/opportunities/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body.status;
  if (!Number.isInteger(id) || !STATUSES.includes(status)) {
    return res.status(400).json({error: "Unknown opportunity or status"});
  }
  try {
    await db.query("UPDATE opportunities SET status = ? WHERE id = ?", [status, id]);
    res.json({message: "Status updated"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Failed to update status"});
  }
});

app.post("/assistant", async (req, res) => {
  const chat = req.body.messages;
  if (!Array.isArray(chat) || chat.length === 0) {
    return res.status(400).json({error: "Send the chat as a messages array"});
  }
  try {
    const answer = await askAssistant(chat);
    res.json({answer: answer});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: error.message});
  }
});

app.post("/checks/run", async (req, res) => {
  if (isChecking()) {
    return res.status(409).json({error: "Already checking. Wait a moment and try again"});
  }
  await checkEverything();
  res.json(lastChecks);
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
