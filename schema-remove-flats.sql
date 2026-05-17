-- ============================================================
-- SCHEMA MIGRATION: REMOVE FLATS ENTITY
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Remove flat_id from rooms table
ALTER TABLE rooms DROP COLUMN IF EXISTS flat_id;

-- 2. Add floor column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor INT NOT NULL DEFAULT 0;

-- 3. Drop the flats table entirely
DROP TABLE IF EXISTS flats CASCADE;
