CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  referral_code VARCHAR(12) NOT NULL UNIQUE,
  referred_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_ref FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profiles (
  user_id INT UNSIGNED PRIMARY KEY,
  phone VARCHAR(30) NULL,
  gender ENUM('male','female') NULL,
  date_of_birth DATE NULL,
  province VARCHAR(100) NULL,
  education_level ENUM('highschool','bachelor','master','phd') NULL,
  institution VARCHAR(200) NULL,
  field_of_study VARCHAR(200) NULL,
  gpa DECIMAL(5,2) NULL,
  english_level ENUM('none','basic','intermediate','advanced') NULL,
  target_countries VARCHAR(300) NULL,
  bio TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('passport','tazkira','transcript','certificate','cv','language','recommendation','other') NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(100) NOT NULL,
  mime VARCHAR(100) NOT NULL,
  size INT UNSIGNED NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_docs_user (user_id),
  INDEX idx_docs_status (status),
  CONSTRAINT fk_docs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meeting_slots (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  starts_at DATETIME NOT NULL,
  duration_min SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  meeting_link VARCHAR(1000) NOT NULL DEFAULT '',
  status ENUM('open','booked','completed','cancelled') NOT NULL DEFAULT 'open',
  booked_by INT UNSIGNED NULL,
  topic VARCHAR(300) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_meet_start (starts_at),
  CONSTRAINT fk_meet_user FOREIGN KEY (booked_by) REFERENCES users(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scholarships (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  country VARCHAR(100) NOT NULL,
  level ENUM('bachelor','master','phd','other') NOT NULL,
  funding ENUM('full','partial') NOT NULL,
  deadline DATE NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  apply_url VARCHAR(1000) NOT NULL,
  source_name VARCHAR(150) NOT NULL,
  source_url VARCHAR(1000) NOT NULL DEFAULT '',
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sch_deadline (deadline),
  INDEX idx_sch_country (country)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
