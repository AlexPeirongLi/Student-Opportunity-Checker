ALTER TABLE opportunities
  ADD COLUMN posted_date DATE NULL DEFAULT (CURRENT_DATE);

DESCRIBE opportunities;
