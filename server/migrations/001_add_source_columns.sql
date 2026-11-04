-- STEP 2: prepare the opportunities table for imported jobs.
--
-- Before (from DESCRIBE opportunities):
--   id, title varchar(100), type, deadline date, location, eligibility, all NOT NULL, and no status column.
--
-- Run once inside MySQL:
--   docker exec -it opportunity-mysql mysql -u root -p opportunity_tracker
-- then paste everything below.

ALTER TABLE opportunities
  -- longer titles, since imported ones are "Job title at Company"
  MODIFY title VARCHAR(255) NOT NULL,
  -- Adzuna doesn't provide these, so they must be allowed to be empty
  MODIFY deadline DATE NULL,
  MODIFY location VARCHAR(100) NULL,
  MODIFY eligibility VARCHAR(150) NULL,
  -- the server already reads and writes status, but the column never existed
  ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Not Applied',
  -- where the row came from: 'manual' (Add Opportunity form) or 'adzuna'
  ADD COLUMN source VARCHAR(50) NOT NULL DEFAULT 'manual',
  -- Adzuna's own id for the job; NULL for manual rows
  ADD COLUMN external_id VARCHAR(100) NULL,
  -- link to apply
  ADD COLUMN url VARCHAR(500) NULL,
  -- the same Adzuna job can only be saved once (INSERT IGNORE relies on this)
  ADD UNIQUE KEY unique_source_job (source, external_id);

-- Check it worked:
DESCRIBE opportunities;
