// Types for the Rental Building Management SaaS

export interface Building {
  id: string;
  user_id: string;
  name: string;
  address: string;
  total_floors: number;
  total_units: number;
  notes: string | null;
  created_at: string;
}

export interface Floor {
  id: string;
  user_id: string;
  building_id: string;
  floor_number: number;
  name: string;
  created_at: string;
  buildings?: Pick<Building, "name">;
}


export interface Room {
  id: string;
  user_id: string;
  building_id: string;
  floor: number;
  room_number: string;
  room_type: "single" | "shared";
  capacity: number;
  current_occupancy: number;
  rent_amount: number;
  status: "vacant" | "occupied" | "maintenance";
  created_at: string;
  buildings?: Pick<Building, "name">;
}

export interface Tenant {
  id: string;
  user_id: string;
  room_id: string;
  building_id: string;
  name: string;
  phone: string;
  join_date: string;
  advance_paid: number;
  id_proof: string | null;
  emergency_contact: string | null;
  status: "active" | "inactive";
  created_at: string;
  rooms?: Pick<Room, "room_number" | "rent_amount">;
  buildings?: Pick<Building, "name">;
}

export interface RentPayment {
  id: string;
  user_id: string;
  tenant_id: string;
  room_id: string;
  amount: number;
  month: number;
  year: number;
  status: "paid" | "unpaid" | "partial";
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  tenants?: Pick<Tenant, "name">;
  rooms?: Pick<Room, "room_number">;
}

export type ExpenseCategory =
  | "electricity"
  | "water"
  | "maintenance"
  | "repair"
  | "salary"
  | "other";

export interface Expense {
  id: string;
  user_id: string;
  building_id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
  buildings?: Pick<Building, "name">;
}

export type MaintenancePriority = "low" | "medium" | "high" | "urgent";
export type MaintenanceStatus = "open" | "in_progress" | "resolved";

export interface MaintenanceRequest {
  id: string;
  user_id: string;
  building_id: string;
  room_id: string | null;
  title: string;
  description: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  created_at: string;
  buildings?: Pick<Building, "name">;
  rooms?: Pick<Room, "room_number"> | null;
}

// Dashboard stats
export interface DashboardStats {
  totalBuildings: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  activeTenants: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingDues: number;
  occupancyRate: number;
  profitLoss: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}
