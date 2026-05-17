import { z } from "zod";

export const buildingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  total_floors: z.coerce.number().int().min(1, "Must have at least 1 floor"),
  total_units: z.coerce.number().int().min(1, "Must have at least 1 unit"),
  notes: z.string().optional(),
});

export const floorSchema = z.object({
  building_id: z.string().uuid("Invalid building"),
  floor_number: z.coerce.number().int().min(0, "Floor number must be 0 or more"),
  name: z.string().min(1, "Floor name is required"),
});

export const roomSchema = z.object({
  building_id: z.string().uuid("Invalid building"),
  floor: z.coerce.number().int().min(0, "Floor number must be 0 or more"),
  room_number: z.string().min(1, "Room number is required"),
  room_type: z.enum(["single", "shared"]),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  rent_amount: z.coerce.number().min(0, "Rent must be positive"),
  status: z.enum(["vacant", "occupied", "maintenance"]),
});

export const tenantSchema = z.object({
  room_id: z.string().uuid("Invalid room"),
  building_id: z.string().uuid("Invalid building"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  join_date: z.string().min(1, "Join date is required"),
  advance_paid: z.coerce.number().min(0, "Advance must be 0 or more"),
  id_proof: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]),
});

export const rentPaymentSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant"),
  room_id: z.string().uuid("Invalid room"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020),
  status: z.enum(["paid", "unpaid", "partial"]),
  paid_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const expenseSchema = z.object({
  building_id: z.string().uuid("Invalid building"),
  category: z.enum(["electricity", "water", "maintenance", "repair", "salary", "other"]),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional().nullable(),
});

export const maintenanceSchema = z.object({
  building_id: z.string().uuid("Invalid building"),
  room_id: z.string().uuid().optional().nullable(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved"]),
});

export type BuildingFormData = z.infer<typeof buildingSchema>;
export type FloorFormData = z.infer<typeof floorSchema>;
export type RoomFormData = z.infer<typeof roomSchema>;
export type TenantFormData = z.infer<typeof tenantSchema>;
export type RentPaymentFormData = z.infer<typeof rentPaymentSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;
