async function searchAdzuna({ what, where }) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Missing ADZUNA ID or KEY in .env")
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key:appKey,
    what:what,
    results_per_page:"20",
  });

  if (where){
    params.append("where",where);
  }

  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?${params}`;
  // TODO: fetch it, check response.ok, turn it into JSON, return data.results
  const response = await fetch(url);
  if (!response.ok){
    throw new Error(`Adzuna request failed with status ${response.status}`);
  }
  const data = await response.json()
  return data.results
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
    eligibility: null,          
    deadline: null,             
    source: "adzuna",
    external_id: String(job.id),
    url: job.redirect_url,
    // when the advert went up, for the timeline. "2026-10-08T23:49:44Z" -> "2026-10-08"
    posted_date: job.created?.slice(0, 10) ?? null,
  };
}

module.exports = {searchAdzuna, toOpportunity};
