-- FreshMongers bootstrap script
-- Creates all tables and loads initial seed data.
-- Run from project root:
--   mysql -u root -p < db/bootstrap.sql

SOURCE db/schema.sql;
SOURCE db/seed.sql;
