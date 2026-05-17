-- BUILDINGS MODULE COMPLETE FIX
-- Run this in your Supabase SQL Editor

-- 1. Ensure user_id column exists
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Handle potential column mismatch (rename total_floors to floors_count if it exists)
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='buildings' and column_name='total_floors') THEN
      ALTER TABLE buildings RENAME COLUMN total_floors TO floors_count;
  END IF;
END $$;

-- 3. Ensure floors_count and total_units exist
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS floors_count INT NOT NULL DEFAULT 1;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS total_units INT NOT NULL DEFAULT 1;

-- 4. Re-enable RLS securely
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- 5. Clean slate: drop any conflicting or incorrectly named policies
DROP POLICY IF EXISTS "buildings_user_isolation" ON buildings;
DROP POLICY IF EXISTS "Users can manage their own buildings" ON buildings;
DROP POLICY IF EXISTS "users_manage_own_buildings" ON buildings;

-- 6. Create bulletproof ALL policy with explicitly strictly scoped USING and WITH CHECK clauses
CREATE POLICY "buildings_user_isolation" ON buildings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
