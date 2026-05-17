"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FloorFormData } from "@/lib/validations";

export async function getFloors(buildingId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("floors")
    .select("*, buildings(name)")
    .eq("user_id", user.id)
    .order("floor_number", { ascending: true });

  if (buildingId) {
    query = query.eq("building_id", buildingId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createFloor(values: FloorFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    user_id: user.id,
  };
  const { error } = await supabase.from("floors").insert(payload);
  if (error) {
    console.error("[SERVICE ERROR] createFloor payload:", payload);
    console.error("[SERVICE ERROR] createFloor Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath(`/buildings/${values.building_id}`);
}

export async function updateFloor(id: string, values: FloorFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("floors").update(values).eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error("[SERVICE ERROR] updateFloor payload:", values);
    console.error("[SERVICE ERROR] updateFloor Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath(`/buildings/${values.building_id}`);
}

export async function deleteFloor(id: string, buildingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("floors").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error(`[SERVICE ERROR] deleteFloor id: ${id} Supabase Error:`, error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath(`/buildings/${buildingId}`);
}
