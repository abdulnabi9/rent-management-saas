-- 1. ADD USER_ID TO ALL TABLES (if not exists)
ALTER TABLE IF EXISTS buildings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS floors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS flats ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS rooms ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS tenants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS rent_payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS maintenance_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES FOR ALL TABLES (Drop existing to prevent duplicates, then recreate)

-- Buildings
DROP POLICY IF EXISTS "Users can manage their own buildings" ON buildings;
CREATE POLICY "Users can manage their own buildings" 
ON buildings FOR ALL USING (auth.uid() = user_id);

-- Floors
DROP POLICY IF EXISTS "Users can manage their own floors" ON floors;
CREATE POLICY "Users can manage their own floors" 
ON floors FOR ALL USING (auth.uid() = user_id);

-- Flats
DROP POLICY IF EXISTS "Users can manage their own flats" ON flats;
CREATE POLICY "Users can manage their own flats" 
ON flats FOR ALL USING (auth.uid() = user_id);

-- Rooms
DROP POLICY IF EXISTS "Users can manage their own rooms" ON rooms;
CREATE POLICY "Users can manage their own rooms" 
ON rooms FOR ALL USING (auth.uid() = user_id);

-- Tenants
DROP POLICY IF EXISTS "Users can manage their own tenants" ON tenants;
CREATE POLICY "Users can manage their own tenants" 
ON tenants FOR ALL USING (auth.uid() = user_id);

-- Rent Payments
DROP POLICY IF EXISTS "Users can manage their own rent payments" ON rent_payments;
CREATE POLICY "Users can manage their own rent payments" 
ON rent_payments FOR ALL USING (auth.uid() = user_id);

-- Expenses
DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
CREATE POLICY "Users can manage their own expenses" 
ON expenses FOR ALL USING (auth.uid() = user_id);

-- Maintenance
DROP POLICY IF EXISTS "Users can manage their own maintenance requests" ON maintenance_requests;
CREATE POLICY "Users can manage their own maintenance requests" 
ON maintenance_requests FOR ALL USING (auth.uid() = user_id);
