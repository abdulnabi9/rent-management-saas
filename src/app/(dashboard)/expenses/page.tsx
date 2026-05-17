import { createClient } from "@/lib/supabase/server";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";
import type { Building, Expense } from "@/types";

export const metadata = { title: "Expenses — RentFlow" };

export default async function ExpensesPage() {
  const supabase = await createClient();
  const [expensesRes, buildingsRes] = await Promise.all([
    supabase.from("expenses").select("*, buildings(name)").order("date", { ascending: false }),
    supabase.from("buildings").select("*").order("name"),
  ]);
  return <ExpensesClient expenses={(expensesRes.data ?? []) as Expense[]} buildings={(buildingsRes.data ?? []) as Building[]} />;
}
