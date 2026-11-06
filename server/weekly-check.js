require("dotenv").config({quiet: true});
const {checkEverything, lastChecks} = require("./checks");
const {getCheckWeek, saveLastCheckedWeek} = require("./schedule");

async function main() {
  const week = getCheckWeek(new Date());
  const worked = await checkEverything();
  console.log(`Adzuna: ${lastChecks.adzuna}`);
  console.log(`Emails: ${lastChecks.emails}`);
  if (worked) {
    if (week !== null) {
      saveLastCheckedWeek(week);
    }
    console.log("Weekly check done");
    process.exit(0);
  }
  console.log("Weekly check had a problem");
  process.exit(1);
}

main();
