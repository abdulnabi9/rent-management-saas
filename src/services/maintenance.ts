"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MaintenanceFormData } from "@/lib/validations";

export async function getMaintenanceRequests(buildingId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("maintenance_requests")
    .select("*, buildings(name), rooms(room_number)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (buildingId) query = query.eq("building_id", buildingId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createMaintenanceRequest(values: MaintenanceFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    user_id: user.id,
    room_id: values.room_id || null,
    description: values.description || null,
  };
  const { error } = await supabase.from("maintenance_requests").insert(payload);
  if (error) {
    console.error("[SERVICE ERROR] createMaintenanceRequest payload:", payload);
    console.error("[SERVICE ERROR] createMaintenanceRequest Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/maintenance");
}

export async function updateMaintenanceRequest(id: string, values: MaintenanceFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    room_id: values.room_id || null,
    description: values.description || null,
  };
  const { error } = await supabase
    .from("maintenance_requests")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[SERVICE ERROR] updateMaintenanceRequest payload:", payload);
    console.error("[SERVICE ERROR] updateMaintenanceRequest Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/maintenance");
}

export async function deleteMaintenanceRequest(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("maintenance_requests")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error(`[SERVICE ERROR] deleteMaintenanceRequest id: ${id} Supabase Error:`, error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/maintenance");
}

export async function updateMaintenanceStatus(
  id: string,
  status: "open" | "in_progress" | "resolved"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("maintenance_requests")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error(`[SERVICE ERROR] updateMaintenanceStatus id: ${id} status: ${status} Supabase Error:`, error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/maintenance");
}
