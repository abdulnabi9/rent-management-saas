import { createClient } from "@/lib/supabase/server";
import { BuildingsClient } from "@/components/buildings/BuildingsClient";

export const metadata = { title: "Buildings — RentFlow" };

export default async function BuildingsPage() {
  const supabase = await createClient();
  const { data: buildings } = await supabase
    .from("buildings")
    .select("*")
    .order("created_at", { ascending: false });

  return <BuildingsClient buildings={buildings ?? []} />;
}
