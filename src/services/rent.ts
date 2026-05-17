"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RentPaymentFormData } from "@/lib/validations";

export async function getRentPayments(filters?: {
  month?: number;
  year?: number;
  tenantId?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("rent_payments")
    .select("*, tenants(name), rooms(room_number)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters?.month) query = query.eq("month", filters.month);
  if (filters?.year) query = query.eq("year", filters.year);
  if (filters?.tenantId) query = query.eq("tenant_id", filters.tenantId);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createRentPayment(values: RentPaymentFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if payment already exists for this month
  const { data: existing } = await supabase
    .from("rent_payments")
    .select("id")
    .eq("tenant_id", values.tenant_id)
    .eq("month", values.month)
    .eq("year", values.year)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Update existing
    const payload = {
      amount: values.amount,
      status: values.status,
      paid_date: values.paid_date || null,
      notes: values.notes || null,
    };
    const { error } = await supabase
      .from("rent_payments")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) {
      console.error("[SERVICE ERROR] updateRentPayment payload:", payload);
      console.error("[SERVICE ERROR] updateRentPayment Supabase Error:", error);
      throw new Error(error.message || "Database operation failed");
    }
  } else {
    const payload = {
      ...values,
      user_id: user.id,
      paid_date: values.paid_date || null,
      notes: values.notes || null,
    };
    const { error } = await supabase.from("rent_payments").insert(payload);
    if (error) {
      console.error("[SERVICE ERROR] createRentPayment payload:", payload);
      console.error("[SERVICE ERROR] createRentPayment Supabase Error:", error);
      throw new Error(error.message || "Database operation failed");
    }
  }

  revalidatePath("/rent");
  revalidatePath("/dashboard");
}

export async function updateRentPayment(id: string, values: Partial<RentPaymentFormData>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = {
    ...values,
    paid_date: values.paid_date || null,
    notes: values.notes || null,
  };
  const { error } = await supabase
    .from("rent_payments")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("[SERVICE ERROR] updateRentPayment payload:", payload);
    console.error("[SERVICE ERROR] updateRentPayment Supabase Error:", error);
    throw new Error(error.message || "Database operation failed");
  }
  revalidatePath("/rent");
  revalidatePath("/dashboard");
}

export async function getMonthlyRentSummary(year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("rent_payments")
    .select("month, amount, status")
    .eq("user_id", user.id)
    .eq("year", year)
    .eq("status", "paid");
  if (error) throw error;

  const summary: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) summary[i] = 0;
  data?.forEach((p) => {
    summary[p.month] = (summary[p.month] || 0) + p.amount;
  });
  return summary;
}
