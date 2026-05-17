import { createClient } from "@/lib/supabase/server";
import { RentClient } from "@/components/rent/RentClient";
import type { RentPayment, Tenant } from "@/types";

export const metadata = { title: "Rent — RentFlow" };

export default async function RentPage() {
  const supabase = await createClient();
  const [paymentsRes, tenantsRes] = await Promise.all([
    supabase.from("rent_payments").select("*, tenants(name), rooms(room_number)").order("created_at", { ascending: false }),
    supabase.from("tenants").select("*, rooms(room_number, rent_amount)").eq("status", "active").order("name"),
  ]);
  return (
    <RentClient
      payments={(paymentsRes.data ?? []) as RentPayment[]}
      tenants={(tenantsRes.data ?? []) as Tenant[]}
    />
  );
}
