import { createClient } from "@/lib/supabase/server";
import { MaintenanceClient } from "@/components/maintenance/MaintenanceClient";
import type { MaintenanceRequest, Building, Room } from "@/types";

export const metadata = { title: "Maintenance — RentFlow" };

export default async function MaintenancePage() {
  const supabase = await createClient();
  const [reqRes, buildingsRes, roomsRes] = await Promise.all([
    supabase.from("maintenance_requests").select("*, buildings(name), rooms(room_number)").order("created_at", { ascending: false }),
    supabase.from("buildings").select("*").order("name"),
    supabase.from("rooms").select("*").order("room_number"),
  ]);
  return (
    <MaintenanceClient
      requests={(reqRes.data ?? []) as MaintenanceRequest[]}
      buildings={(buildingsRes.data ?? []) as Building[]}
      rooms={(roomsRes.data ?? []) as Room[]}
    />
  );
}
