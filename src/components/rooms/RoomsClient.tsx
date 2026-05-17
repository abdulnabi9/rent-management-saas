"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { roomSchema, type RoomFormData } from "@/lib/validations";
import { createRoom, updateRoom, deleteRoom } from "@/services/rooms";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BedDouble, Plus, MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn, STATUS_COLORS, formatCurrency } from "@/lib/utils";
import type { Room, Building } from "@/types";

interface RoomsClientProps {
  rooms: Room[];
  buildings: Building[];
}

export function RoomsClient({ rooms, buildings }: RoomsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(roomSchema) as any,
    defaultValues: { room_type: "single", status: "vacant", capacity: 1, rent_amount: 0, floor: 0 },
  });

  function openEdit(room: Room) {
    setEditRoom(room);
    reset({
      building_id: room.building_id,
      floor: room.floor,
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      rent_amount: room.rent_amount,
      status: room.status,
    });
    setShowForm(true);
  }

  function onSubmit(values: RoomFormData) {
    startTransition(async () => {
      try {
        if (editRoom) {
          await updateRoom(editRoom.id, values);
          toast.success("Room updated!");
        } else {
          await createRoom(values);
          toast.success("Room added!");
          reset({ room_type: "single", status: "vacant", capacity: 1, rent_amount: 0, floor: 0 });
        }
        setShowForm(false);
        setEditRoom(undefined);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteRoom(deleteId);
        toast.success("Room deleted");
        setDeleteId(null);
      } catch {
        toast.error("Failed to delete room");
      }
    });
  }

  const roomType = watch("room_type");

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rooms</h2>
          <p className="text-sm text-gray-500 mt-0.5">{rooms.length} room{rooms.length !== 1 ? "s" : ""} across all buildings</p>
        </div>
        <Button onClick={() => { setEditRoom(undefined); reset({ room_type: "single", status: "vacant", capacity: 1, rent_amount: 0, floor: 0 }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState icon={BedDouble} title="No rooms yet" description="Add rooms to your buildings to start tracking occupancy and rent." action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Room</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <BedDouble className="w-5 h-5 text-indigo-600" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(room)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(room.id)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Room {room.room_number}</h3>
              <p className="text-xs text-gray-500 mb-2">{room.buildings?.name ?? "—"} • Floor {room.floor}</p>
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 capitalize">{room.room_type}</span>
                  <span className="font-medium text-gray-700">{formatCurrency(room.rent_amount)}/mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Occupancy</span>
                  <span className="font-medium">{room.current_occupancy}/{room.capacity}</span>
                </div>
              </div>
              <Badge className={cn("text-xs capitalize w-full justify-center", STATUS_COLORS[room.status])}>
                {room.status}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Room Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditRoom(undefined); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editRoom ? "Edit Room" : "Add Room"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label>Building *</Label>
              <Select onValueChange={(v) => setValue("building_id", v || "")} defaultValue={editRoom?.building_id ?? undefined}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.building_id && <p className="text-red-500 text-xs mt-1">{errors.building_id.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="room_number">Room Number *</Label>
                <Input id="room_number" placeholder="101" className="mt-1" {...register("room_number")} />
                {errors.room_number && <p className="text-red-500 text-xs mt-1">{errors.room_number.message}</p>}
              </div>
              <div>
                <Label htmlFor="floor">Floor *</Label>
                <Input id="floor" type="number" className="mt-1" {...register("floor")} />
                {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room Type *</Label>
                <Select onValueChange={(v) => setValue("room_type", v as "single" | "shared")} defaultValue={editRoom?.room_type ?? "single"}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input id="capacity" type="number" min={1} className="mt-1" {...register("capacity")} />
              </div>
              <div>
                <Label htmlFor="rent_amount">Rent Amount (₹) *</Label>
                <Input id="rent_amount" type="number" min={0} className="mt-1" {...register("rent_amount")} />
              </div>
            </div>
            <div>
              <Label>Status *</Label>
              <Select onValueChange={(v) => setValue("status", v as Room["status"])} defaultValue={editRoom?.status ?? "vacant"}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editRoom ? "Save Changes" : "Add Room"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Room"
        description="Are you sure you want to delete this room? All tenant and rent data will be affected."
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}
