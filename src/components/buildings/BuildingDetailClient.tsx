"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { floorSchema, type FloorFormData } from "@/lib/validations";
import { createFloor, deleteFloor } from "@/services/floors";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, Trash2, BedDouble, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Building, Floor, Room } from "@/types";
import { cn, STATUS_COLORS } from "@/lib/utils";

interface BuildingDetailClientProps {
  building: Building;
  floors: Floor[];
  rooms: Room[];
}

export function BuildingDetailClient({ building, floors, rooms }: BuildingDetailClientProps) {
  const [showFloorForm, setShowFloorForm] = useState(false);
  const [deleteFloorId, setDeleteFloorId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FloorFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(floorSchema) as any,
    defaultValues: { building_id: building.id, floor_number: floors.length },
  });

  function onAddFloor(values: FloorFormData) {
    startTransition(async () => {
      try {
        await createFloor(values);
        toast.success("Floor added!");
        reset({ building_id: building.id, floor_number: floors.length + 1 });
        setShowFloorForm(false);
      } catch {
        toast.error("Failed to add floor");
      }
    });
  }

  function handleDeleteFloor() {
    if (!deleteFloorId) return;
    startTransition(async () => {
      try {
        await deleteFloor(deleteFloorId, building.id);
        toast.success("Floor deleted");
        setDeleteFloorId(null);
      } catch {
        toast.error("Failed to delete floor");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/buildings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Buildings
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{building.name}</h2>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4" /> {building.address}
            </div>
          </div>
          <Button onClick={() => setShowFloorForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Add Floor
          </Button>
        </div>
      </div>

      {/* Building stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Floors", value: building.total_floors },
          { label: "Total Units", value: building.total_units },
          { label: "Rooms Added", value: rooms.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Floors list */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" /> Floors
        </h3>
        {floors.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No floors added yet</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowFloorForm(true)}>
              Add First Floor
            </Button>
          </div>
        ) : (
          floors.map((floor) => {
            const floorRooms = rooms.filter((r) => r.floor === floor.floor_number && r.building_id === building.id);
            return (
              <div key={floor.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
                      {floor.floor_number}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{floor.name}</p>
                      <p className="text-xs text-gray-400">Floor {floor.floor_number}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteFloorId(floor.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rooms in this building */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <BedDouble className="w-4 h-4 text-blue-600" /> Rooms in this Building
        </h3>
        {rooms.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <BedDouble className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No rooms added yet</p>
            <Link href="/rooms">
              <Button variant="outline" size="sm" className="mt-3">Go to Rooms</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">Room {room.room_number}</span>
                  <Badge className={cn("text-xs capitalize", STATUS_COLORS[room.status])}>
                    {room.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Type: <span className="capitalize">{room.room_type}</span></p>
                  <p>Capacity: {room.current_occupancy}/{room.capacity}</p>
                  <p className="font-medium text-gray-700">₹{room.rent_amount.toLocaleString("en-IN")}/mo</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Floor Dialog */}
      <Dialog open={showFloorForm} onOpenChange={setShowFloorForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Floor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddFloor)} className="space-y-4 mt-2">
            <input type="hidden" {...register("building_id")} />
            <div>
              <Label htmlFor="floor_number">Floor Number</Label>
              <Input id="floor_number" type="number" min={0} className="mt-1" {...register("floor_number")} />
              {errors.floor_number && <p className="text-red-500 text-xs mt-1">{errors.floor_number.message}</p>}
            </div>
            <div>
              <Label htmlFor="floor_name">Floor Name</Label>
              <Input id="floor_name" placeholder="e.g. Ground Floor, First Floor" className="mt-1" {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowFloorForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Floor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteFloorId}
        onOpenChange={(open) => !open && setDeleteFloorId(null)}
        title="Delete Floor"
        description="Are you sure you want to delete this floor?"
        onConfirm={handleDeleteFloor}
        loading={isPending}
      />
    </div>
  );
}
