-- ============================================================
-- RentFlow — Complete Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- BUILDINGS
-- ============================================================
CREATE TABLE buildings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  floors_count INT NOT NULL DEFAULT 1 CHECK (floors_count > 0),
  total_units  INT NOT NULL DEFAULT 1 CHECK (total_units > 0),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buildings_user_isolation" ON buildings
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_buildings_user_id ON buildings(user_id);

-- ============================================================
-- FLOORS
-- ============================================================
CREATE TABLE floors (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  building_id  UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_number INT NOT NULL DEFAULT 0,
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE floors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "floors_user_isolation" ON floors
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_floors_user_id ON floors(user_id);
CREATE INDEX idx_floors_building_id ON floors(building_id);
CREATE UNIQUE INDEX idx_floors_building_floor ON floors(building_id, floor_number);

-- ============================================================
-- FLATS
-- ============================================================
CREATE TABLE flats (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  floor_id    UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  flat_type   TEXT NOT NULL DEFAULT 'Other' CHECK (flat_type IN ('1BHK','2BHK','3BHK','Studio','Other')),
  rent_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (rent_amount >= 0),
  status      TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied','vacant','maintenance')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE flats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flats_user_isolation" ON flats
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_flats_user_id ON flats(user_id);
CREATE INDEX idx_flats_building_id ON flats(building_id);
CREATE INDEX idx_flats_floor_id ON flats(floor_id);

-- ============================================================
-- ROOMS
-- ============================================================
CREATE TABLE rooms (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flat_id           UUID REFERENCES flats(id) ON DELETE SET NULL,
  building_id       UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  room_number       TEXT NOT NULL,
  room_type         TEXT NOT NULL DEFAULT 'single' CHECK (room_type IN ('single','shared')),
  capacity          INT NOT NULL DEFAULT 1 CHECK (capacity > 0),
  current_occupancy INT NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0),
  rent_amount       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (rent_amount >= 0),
  status            TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT occupancy_check CHECK (current_occupancy <= capacity)
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_user_isolation" ON rooms
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_rooms_building_id ON rooms(building_id);
CREATE INDEX idx_rooms_status ON rooms(user_id, status);

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE tenants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id           UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  building_id       UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  join_date         DATE NOT NULL,
  advance_paid      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (advance_paid >= 0),
  id_proof          TEXT,
  emergency_contact TEXT,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_user_isolation" ON tenants
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_tenants_user_id ON tenants(user_id);
CREATE INDEX idx_tenants_room_id ON tenants(room_id);
CREATE INDEX idx_tenants_building_id ON tenants(building_id);
CREATE INDEX idx_tenants_status ON tenants(user_id, status);

-- ============================================================
-- RENT PAYMENTS
-- ============================================================
CREATE TABLE rent_payments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  amount     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  month      INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year       INT NOT NULL CHECK (year >= 2020),
  status     TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid','unpaid','partial')),
  paid_date  DATE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, month, year)
);

ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rent_payments_user_isolation" ON rent_payments
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_rent_user_id ON rent_payments(user_id);
CREATE INDEX idx_rent_tenant_id ON rent_payments(tenant_id);
CREATE INDEX idx_rent_month_year ON rent_payments(user_id, year, month);
CREATE INDEX idx_rent_status ON rent_payments(user_id, status);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('electricity','water','maintenance','repair','salary','other')),
  amount      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  date        DATE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_user_isolation" ON expenses
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_building_id ON expenses(building_id);
CREATE INDEX idx_expenses_date ON expenses(user_id, date);
CREATE INDEX idx_expenses_category ON expenses(user_id, category);

-- ============================================================
-- MAINTENANCE REQUESTS
-- ============================================================
CREATE TABLE maintenance_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  room_id     UUID REFERENCES rooms(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_user_isolation" ON maintenance_requests
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX idx_maintenance_user_id ON maintenance_requests(user_id);
CREATE INDEX idx_maintenance_building_id ON maintenance_requests(building_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(user_id, status);
CREATE INDEX idx_maintenance_priority ON maintenance_requests(user_id, priority);

-- ============================================================
-- HELPER FUNCTIONS (for room occupancy)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_room_occupancy(room_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE rooms
  SET
    current_occupancy = current_occupancy + 1,
    status = CASE WHEN current_occupancy + 1 >= capacity THEN 'occupied' ELSE status END
  WHERE id = room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_room_occupancy(room_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE rooms
  SET
    current_occupancy = GREATEST(current_occupancy - 1, 0),
    status = CASE WHEN current_occupancy - 1 <= 0 THEN 'available' ELSE status END
  WHERE id = room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER maintenance_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
