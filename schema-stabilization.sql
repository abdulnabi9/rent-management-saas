-- ============================================================
-- SCHEMA STABILIZATION SCRIPT
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Update rooms table status constraint
-- First, we need to find the name of the constraint to drop it safely.
-- However, we can also just use a DO block to replace it or just alter it if we know the column name.
-- To be safe, we will drop any constraint on the status column and recreate it.
DO $$ 
DECLARE
  constraint_name text;
BEGIN
  -- Find the check constraint on the status column for the rooms table
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'rooms'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE rooms DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

-- Update existing records that might have 'available' to 'vacant'
UPDATE rooms SET status = 'vacant' WHERE status = 'available';

-- Add the corrected check constraint mapping to our frontend
ALTER TABLE rooms ADD CONSTRAINT rooms_status_check 
  CHECK (status IN ('vacant', 'occupied', 'maintenance'));

-- Change the default value of the column
ALTER TABLE rooms ALTER COLUMN status SET DEFAULT 'vacant';


-- 2. Update the helper function decrement_room_occupancy
CREATE OR REPLACE FUNCTION decrement_room_occupancy(room_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE rooms
  SET
    current_occupancy = GREATEST(current_occupancy - 1, 0),
    status = CASE WHEN current_occupancy - 1 <= 0 THEN 'vacant' ELSE status END
  WHERE id = room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
