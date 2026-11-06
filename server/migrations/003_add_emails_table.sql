CREATE TABLE IF NOT EXISTS emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(20) NOT NULL,
  external_id VARCHAR(255) NULL,
  subject VARCHAR(500) NOT NULL,
  sender VARCHAR(255) NULL,
  received_at DATETIME NULL,
  summary TEXT NOT NULL,
  needs_reply BOOLEAN NOT NULL DEFAULT FALSE,
  opportunities_found INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_source_email (source, external_id)
);

DESCRIBE emails;
