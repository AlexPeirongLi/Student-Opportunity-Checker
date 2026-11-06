const fs = require("fs");
const path = require("path");
const {toDateText} = require("./isOpen");
const {DAY_NAMES} = require("./lists");
const LAST_CHECK_FILE = path.join(__dirname, "last-check.json");

function getCheckWeek(now) {
  const day = DAY_NAMES[now.getDay()];
  const hour = now.getHours();
  if (day === "Thursday" && hour >= 13) {
    return toDateText(now);
  }
  if (day === "Friday" && hour < 13) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return toDateText(yesterday);
  }
  return null;
}

function readLastCheckedWeek() {
  if (!fs.existsSync(LAST_CHECK_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(LAST_CHECK_FILE, "utf8")).week;
}

function saveLastCheckedWeek(week) {
  fs.writeFileSync(LAST_CHECK_FILE, JSON.stringify({week: week}));
}

module.exports = {getCheckWeek, readLastCheckedWeek, saveLastCheckedWeek};
