import { createClient } from "@/lib/supabase/server";
import { TenantsClient } from "@/components/tenants/TenantsClient";
import type { Tenant, Room, Building } from "@/types";

export const metadata = { title: "Tenants — RentFlow" };

export default async function TenantsPage() {
  const supabase = await createClient();
  const [tenantsRes, roomsRes, buildingsRes] = await Promise.all([
    supabase.from("tenants").select("*, rooms(room_number, rent_amount), buildings(name)").order("created_at", { ascending: false }),
    supabase.from("rooms").select("*").order("room_number"),
    supabase.from("buildings").select("*").order("name"),
  ]);
  return (
    <TenantsClient
      tenants={(tenantsRes.data ?? []) as Tenant[]}
      rooms={(roomsRes.data ?? []) as Room[]}
      buildings={(buildingsRes.data ?? []) as Building[]}
    />
  );
}
