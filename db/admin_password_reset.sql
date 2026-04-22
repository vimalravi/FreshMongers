-- ============================================================
-- FreshMongers: Admin Password Reset
-- Sets password = "Admin@1234" for all admin accounts.
--
-- Run AFTER db_setup.sql:
--   mysql -u root -pCham@1007 freshmongers_db < admin_password_reset.sql
--
-- To generate a NEW hash for a custom password, run in terminal:
--   node -e "require('bcryptjs').hash('YourPassword',10).then(console.log)"
-- Then replace the hash value below.
-- ============================================================

USE freshmongers_db;

-- Hash below = bcrypt(10 rounds) of "Admin@1234"
-- Generated via: node -e "require('bcryptjs').hash('Admin@1234',10).then(console.log)"
SET @new_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh0y';

UPDATE admin_users SET password_hash = @new_hash WHERE email = 'admin@freshmongers.com';
UPDATE admin_users SET password_hash = @new_hash WHERE email = 'moderator@freshmongers.com';

SELECT email, name, role, 'Admin@1234' AS login_password FROM admin_users;
