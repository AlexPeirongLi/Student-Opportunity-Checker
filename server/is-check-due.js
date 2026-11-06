const {getCheckWeek, readLastCheckedWeek} = require("./schedule");
const week = getCheckWeek(new Date());

if (week === null) {
  console.log("Not between Thursday 1pm and Friday 1pm");
  process.exit(1);
}

if (readLastCheckedWeek() === week) {
  console.log("Already checked this week");
  process.exit(1);
}

console.log("A check is due");
process.exit(0);
