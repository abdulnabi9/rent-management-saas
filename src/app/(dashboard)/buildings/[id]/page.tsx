import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BuildingDetailClient } from "@/components/buildings/BuildingDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BuildingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [buildingRes, floorsRes, roomsRes] = await Promise.all([
    supabase.from("buildings").select("*").eq("id", id).single(),
    supabase.from("floors").select("*").eq("building_id", id).order("floor_number"),
    supabase.from("rooms").select("*").eq("building_id", id).order("room_number"),
  ]);

  if (buildingRes.error || !buildingRes.data) notFound();

  return (
    <BuildingDetailClient
      building={buildingRes.data}
      floors={floorsRes.data ?? []}
      rooms={roomsRes.data ?? []}
    />
  );
}
