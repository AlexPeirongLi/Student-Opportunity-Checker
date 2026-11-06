const EMAIL_SUBJECT_HAS = "Wednesday Waggle";
const EMAILS_TO_CHECK = 10;

const ADZUNA_SEARCHES = [
  {what: "software engineer intern", where: ""},
  {what: "software developer placement", where: ""},
  {what: "graduate software engineer", where: ""},
];
const ADZUNA_SKIP_IF_TITLE_HAS = ["no experience needed", "apprentice", "it online learning"];
const ADZUNA_MAX_DAYS_OLD = 14;

module.exports = {
  EMAIL_SUBJECT_HAS,
  EMAILS_TO_CHECK,
  ADZUNA_SEARCHES,
  ADZUNA_SKIP_IF_TITLE_HAS,
  ADZUNA_MAX_DAYS_OLD,
};
