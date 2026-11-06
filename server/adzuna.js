const {ADZUNA_MAX_DAYS_OLD} = require("./settings");

async function searchAdzuna(what, where) {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    throw new Error("Missing ADZUNA_APP_ID or ADZUNA_APP_KEY in .env");
  }
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    what: what,
    results_per_page: "20",
    max_days_old: String(ADZUNA_MAX_DAYS_OLD),
  });
  if (where) {
    params.append("where", where);
  }
  const response = await fetch(`https://api.adzuna.com/v1/api/jobs/gb/search/1?${params}`);
  if (!response.ok) {
    throw new Error(`Adzuna request failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.results;
}

function toOpportunity(job) {
  const lowerTitle = job.title.toLowerCase();
  let type = "Job";
  if (lowerTitle.includes("intern") || lowerTitle.includes("placement")) {
    type = "Internship";
  } else if (lowerTitle.includes("graduate")) {
    type = "Graduate";
  }
  return {
    title: `${job.title} at ${job.company?.display_name ?? "Unknown company"}`,
    type: type,
    location: job.location?.display_name ?? null,
    external_id: String(job.id),
    url: job.redirect_url,
    posted_date: job.created?.slice(0, 10) ?? null,
  };
}

module.exports = {searchAdzuna, toOpportunity};
