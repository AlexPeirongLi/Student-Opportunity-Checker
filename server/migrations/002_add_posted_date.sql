-- Add a start date for the timeline: when the opportunity was posted / opened.
--
-- Adzuna rows: filled from the job's `created` date by toOpportunity().
-- Manual rows (Add Opportunity form): the INSERT doesn't mention posted_date, so the DEFAULT
-- fills in the day you added it. Rows that already exist also get today's date.
--
-- Run from the project root (Docker must be running):
--   Get-Content server\migrations\002_add_posted_date.sql | docker exec -i opportunity-mysql mysql -u root -ppassword opportunity_tracker

ALTER TABLE opportunities
  -- (CURRENT_DATE) in brackets = an expression default, allowed since MySQL 8.0.13
  ADD COLUMN posted_date DATE NULL DEFAULT (CURRENT_DATE);

-- Check it worked:
DESCRIBE opportunities;
