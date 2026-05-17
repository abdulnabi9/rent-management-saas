"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteBuilding } from "@/services/buildings";
import { BuildingForm } from "@/components/buildings/BuildingForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, Plus, MoreVertical, Pencil, Trash2, MapPin, Layers, Home } from "lucide-react";
import Link from "next/link";
import type { Building } from "@/types";

interface BuildingsClientProps {
  buildings: Building[];
}

export function BuildingsClient({ buildings }: BuildingsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editBuilding, setEditBuilding] = useState<Building | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteBuilding(deleteId);
        toast.success("Building deleted");
        setDeleteId(null);
      } catch {
        toast.error("Failed to delete building");
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Buildings</h2>
          <p className="text-sm text-gray-500 mt-0.5">{buildings.length} building{buildings.length !== 1 ? "s" : ""} in your portfolio</p>
        </div>
        <Button onClick={() => { setEditBuilding(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Building
        </Button>
      </div>

      {buildings.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No buildings yet"
          description="Add your first building to start managing your rental portfolio."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Building
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((building) => (
            <div key={building.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditBuilding(building); setShowForm(true); }}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(building.id)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-gray-900 text-base mb-1">{building.name}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{building.address}</span>
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <Layers className="h-4 w-4" />
                    {building.total_floors} floor{building.total_floors !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Home className="w-3.5 h-3.5 text-gray-400" />
                    {building.total_units} unit{building.total_units !== 1 ? "s" : ""}
                  </div>
                </div>

                {building.notes && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{building.notes}</p>
                )}

                <Link href={`/buildings/${building.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <BuildingForm
        open={showForm}
        onOpenChange={(open) => { setShowForm(open); if (!open) setEditBuilding(undefined); }}
        building={editBuilding}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Building"
        description="This will permanently delete the building and all associated data. This action cannot be undone."
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}
