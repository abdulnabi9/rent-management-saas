"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ExpenseFormData } from "@/lib/validations";

export async function getExpenses(buildingId?: string, month?: number, year?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("expenses")
    .select("*, buildings(name)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (buildingId) query = query.eq("building_id", buildingId);
  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];
    query = query.gte("date", startDate).lte("date", endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createExpense(values: ExpenseFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    user_id: user.id,
    description: values.description || null,
  };
  const { error } = await supabase.from("expenses").insert(payload);
  if (error) {
    console.error("[SERVICE ERROR] createExpense payload:", payload);
    console.error("[SERVICE ERROR] createExpense Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function updateExpense(id: string, values: ExpenseFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = { ...values, description: values.description || null };
  const { error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[SERVICE ERROR] updateExpense payload:", payload);
    console.error("[SERVICE ERROR] updateExpense Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/expenses");
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    console.error(`[SERVICE ERROR] deleteExpense id: ${id} Supabase Error:`, error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function getMonthlyExpenses(year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const { data, error } = await supabase
    .from("expenses")
    .select("date, amount, category")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);
  if (error) throw error;
  return data;
}
