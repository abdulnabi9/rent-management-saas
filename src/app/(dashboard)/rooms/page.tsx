import { createClient } from "@/lib/supabase/server";
import { RoomsClient } from "@/components/rooms/RoomsClient";
import type { Room, Building } from "@/types";

export const metadata = { title: "Rooms — RentFlow" };

export default async function RoomsPage() {
  const supabase = await createClient();
  const [roomsRes, buildingsRes] = await Promise.all([
    supabase.from("rooms").select("*, buildings(name)").order("created_at", { ascending: false }),
    supabase.from("buildings").select("*").order("name"),
  ]);
  return <RoomsClient rooms={(roomsRes.data ?? []) as Room[]} buildings={(buildingsRes.data ?? []) as Building[]} />;
}
