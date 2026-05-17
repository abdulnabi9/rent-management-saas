"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { BuildingFormData } from "@/lib/validations";

export async function getBuildings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("buildings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBuilding(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function createBuilding(values: BuildingFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    user_id: user.id,
    notes: values.notes || null,
  };
  const { error } = await supabase.from("buildings").insert(payload);
  if (error) {
    console.error("[SERVICE ERROR] createBuilding payload:", payload);
    console.error("[SERVICE ERROR] createBuilding Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/buildings");
  revalidatePath("/dashboard");
}

export async function updateBuilding(id: string, values: BuildingFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = { ...values, notes: values.notes || null };
  const { error } = await supabase
    .from("buildings")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[SERVICE ERROR] updateBuilding payload:", payload);
    console.error("[SERVICE ERROR] updateBuilding Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/buildings");
  revalidatePath(`/buildings/${id}`);
}

export async function deleteBuilding(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("buildings").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error(`[SERVICE ERROR] deleteBuilding id: ${id} Supabase Error:`, error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/buildings");
  revalidatePath("/dashboard");
}
