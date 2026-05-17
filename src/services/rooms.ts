"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RoomFormData } from "@/lib/validations";

export async function getRooms(buildingId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("rooms")
    .select("*, buildings(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (buildingId) {
    query = query.eq("building_id", buildingId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getRoom(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("rooms")
    .select("*, buildings(name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function createRoom(values: RoomFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    user_id: user.id,
    current_occupancy: 0,
    floor: values.floor,
  };
  const { error } = await supabase.from("rooms").insert(payload);
  if (error) {
    console.error("[SERVICE ERROR] createRoom payload:", payload);
    console.error("[SERVICE ERROR] createRoom Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/rooms");
  revalidatePath("/dashboard");
}

export async function updateRoom(id: string, values: RoomFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = { ...values, floor: values.floor };
  const { error } = await supabase
    .from("rooms")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[SERVICE ERROR] updateRoom payload:", payload);
    console.error("[SERVICE ERROR] updateRoom Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/rooms");
}

export async function deleteRoom(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("rooms").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error(`[SERVICE ERROR] deleteRoom id: ${id} Supabase Error:`, error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/rooms");
  revalidatePath("/dashboard");
}
