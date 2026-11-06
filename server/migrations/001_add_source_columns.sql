ALTER TABLE opportunities
  MODIFY title VARCHAR(255) NOT NULL,
  MODIFY deadline DATE NULL,
  MODIFY location VARCHAR(100) NULL,
  MODIFY eligibility VARCHAR(150) NULL,
  ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Not Applied',
  ADD COLUMN source VARCHAR(50) NOT NULL DEFAULT 'manual',
  ADD COLUMN external_id VARCHAR(100) NULL,
  ADD COLUMN url VARCHAR(500) NULL,
  ADD UNIQUE KEY unique_source_job (source, external_id);

DESCRIBE opportunities;
