"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TenantFormData } from "@/lib/validations";

export async function getTenants(buildingId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("tenants")
    .select("*, rooms(room_number, rent_amount), buildings(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (buildingId) {
    query = query.eq("building_id", buildingId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTenant(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tenants")
    .select("*, rooms(room_number, rent_amount), buildings(name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function createTenant(values: TenantFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    user_id: user.id,
    id_proof: values.id_proof || null,
    emergency_contact: values.emergency_contact || null,
  };
  const { error } = await supabase.from("tenants").insert(payload);
  if (error) {
    console.error("[SERVICE ERROR] createTenant payload:", payload);
    console.error("[SERVICE ERROR] createTenant Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }

  // Update room occupancy
  await supabase.rpc("increment_room_occupancy", { room_id: values.room_id });

  revalidatePath("/tenants");
  revalidatePath("/dashboard");
}

export async function updateTenant(id: string, values: TenantFormData, oldRoomId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    id_proof: values.id_proof || null,
    emergency_contact: values.emergency_contact || null,
  };
  const { error } = await supabase
    .from("tenants")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[SERVICE ERROR] updateTenant payload:", payload);
    console.error("[SERVICE ERROR] updateTenant Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }

  // Handle room change
  if (oldRoomId && oldRoomId !== values.room_id) {
    await supabase.rpc("decrement_room_occupancy", { room_id: oldRoomId });
    await supabase.rpc("increment_room_occupancy", { room_id: values.room_id });
  }

  revalidatePath("/tenants");
}

export async function deleteTenant(id: string, roomId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("tenants").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error(`[SERVICE ERROR] deleteTenant id: ${id} Supabase Error:`, error);
    throw new Error(error.message || "Database operation failed");
  }

  await supabase.rpc("decrement_room_occupancy", { room_id: roomId });

  revalidatePath("/tenants");
  revalidatePath("/dashboard");
}
