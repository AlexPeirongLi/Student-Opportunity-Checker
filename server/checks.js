const db = require("./db");
const gmail = require("./gmail");
const {searchAdzuna, toOpportunity} = require("./adzuna");
const {toDateText} = require("./isOpen");
const {analyzeEmail} = require("./emailAnalysis");
const {EMAILS_TO_CHECK, ADZUNA_SEARCHES, ADZUNA_SKIP_IF_TITLE_HAS} = require("./settings");

const lastChecks = {
  adzuna: "",
  emails: "",
};
let checkingEverything = false;

function cutText(value, maxLength) {
  if (!value) {
    return null;
  }
  return String(value).slice(0, maxLength);
}

function cleanDate(value) {
  if (!value || value.length !== 10 || isNaN(Date.parse(value))) {
    return null;
  }
  return value;
}

function cleanUrl(value) {
  if (!value) {
    return null;
  }
  if (!value.startsWith("https://") && !value.startsWith("http://")) {
    return null;
  }
  return value.slice(0, 500);
}

async function getSavedTitles() {
  const [rows] = await db.query("SELECT title FROM opportunities");
  const titles = [];
  for (const row of rows) {
    titles.push(row.title.toLowerCase());
  }
  return titles;
}

async function getSavedUrls() {
  const [rows] = await db.query("SELECT url FROM opportunities WHERE url IS NOT NULL");
  const urls = [];
  for (const row of rows) {
    urls.push(row.url);
  }
  return urls;
}

async function saveOpportunity(opportunity, source, externalId, postedDate) {
  const [result] = await db.query(
    `INSERT IGNORE INTO opportunities
      (title, type, location, eligibility, deadline, status, source, external_id, url, posted_date)
      VALUES (?, ?, ?, ?, ?, 'Not Applied', ?, ?, ?, ?)`,
    [
      cutText(opportunity.title, 255),
      opportunity.type,
      cutText(opportunity.location, 100),
      cutText(opportunity.eligibility, 150),
      cleanDate(opportunity.deadline),
      source,
      externalId,
      cleanUrl(opportunity.url),
      cleanDate(postedDate),
    ],
  );
  return result.affectedRows;
}

function shouldSkipJob(title) {
  for (const word of ADZUNA_SKIP_IF_TITLE_HAS) {
    if (title.includes(word)) {
      return true;
    }
  }
  return false;
}

async function importSavedSearches() {
  const savedTitles = await getSavedTitles();
  let added = 0;
  for (const search of ADZUNA_SEARCHES) {
    const jobs = await searchAdzuna(search.what, search.where);
    for (const job of jobs) {
      const opportunity = toOpportunity(job);
      const title = cutText(opportunity.title, 255).toLowerCase();
      if (shouldSkipJob(title) || savedTitles.includes(title)) {
        continue;
      }
      savedTitles.push(title);
      added += await saveOpportunity(opportunity, "adzuna", opportunity.external_id, opportunity.posted_date);
    }
  }
  return added;
}

async function readEmail(email) {
  const analysis = await analyzeEmail(email);
  let receivedAt = null;
  let postedDate = toDateText(new Date());
  if (email.receivedAt) {
    receivedAt = email.receivedAt.replace("T", " ").slice(0, 19);
    postedDate = receivedAt.slice(0, 10);
  }
  const savedTitles = await getSavedTitles();
  const savedUrls = await getSavedUrls();
  let added = 0;
  for (const opportunity of analysis.opportunities) {
    const title = cutText(opportunity.title, 255).toLowerCase();
    const url = cleanUrl(opportunity.url);
    if (savedTitles.includes(title) || (url && savedUrls.includes(url))) {
      continue;
    }
    savedTitles.push(title);
    if (url) {
      savedUrls.push(url);
    }
    added += await saveOpportunity(opportunity, "email", null, postedDate);
  }
  await db.query(
    `INSERT INTO emails
      (source, external_id, subject, sender, received_at, summary, opportunities_found)
      VALUES ('gmail', ?, ?, ?, ?, ?, ?)`,
    [
      cutText(email.id, 255),
      cutText(email.subject, 500),
      cutText(email.sender, 255),
      receivedAt,
      analysis.summary,
      added,
    ],
  );
  return added;
}

async function checkEmails() {
  const emails = await gmail.getRecentEmails(EMAILS_TO_CHECK);
  let checked = 0;
  let failed = 0;
  let opportunitiesFound = 0;
  let lastError = "";
  for (const email of emails) {
    const [existing] = await db.query(
      "SELECT id FROM emails WHERE source = 'gmail' AND external_id = ?",
      [cutText(email.id, 255)],
    );
    if (existing.length > 0) {
      continue;
    }
    try {
      opportunitiesFound += await readEmail(email);
      checked += 1;
    } catch (error) {
      console.error(`Could not read email "${email.subject}"`, error);
      failed += 1;
      lastError = error.message;
    }
  }
  return {checked: checked, failed: failed, opportunitiesFound: opportunitiesFound, lastError: lastError};
}

async function checkEmailsAndSave() {
  if (!gmail.isConfigured()) {
    lastChecks.emails = "Missing Gmail details in .env";
    return true;
  }
  try {
    const result = await checkEmails();
    lastChecks.emails = `${result.checked} new emails, ${result.opportunitiesFound} new opportunities`;
    if (result.failed > 0) {
      lastChecks.emails += `, ${result.failed} couldn't be read (${result.lastError})`;
      return false;
    }
    return true;
  } catch (error) {
    console.error("Email check failed", error);
    lastChecks.emails = `Failed: ${error.message}`;
    return false;
  }
}

async function importAdzunaAndSave() {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    lastChecks.adzuna = "Missing Adzuna keys in .env";
    return true;
  }
  try {
    const added = await importSavedSearches();
    lastChecks.adzuna = `${added} new jobs`;
    return true;
  } catch (error) {
    console.error("Adzuna import failed", error);
    lastChecks.adzuna = `Failed: ${error.message}`;
    return false;
  }
}

async function checkEverything() {
  if (checkingEverything) {
    return false;
  }
  checkingEverything = true;
  const adzunaWorked = await importAdzunaAndSave();
  const emailsWorked = await checkEmailsAndSave();
  checkingEverything = false;
  return adzunaWorked && emailsWorked;
}

function isChecking() {
  return checkingEverything;
}

module.exports = {checkEverything, isChecking, lastChecks};
