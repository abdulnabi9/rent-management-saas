"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { tenantSchema, type TenantFormData } from "@/lib/validations";
import { createTenant, updateTenant, deleteTenant } from "@/services/tenants";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Plus, MoreVertical, Pencil, Trash2, Loader2, Phone, Calendar, Building2 } from "lucide-react";
import { cn, STATUS_COLORS, formatCurrency, formatDate } from "@/lib/utils";
import type { Tenant, Room, Building } from "@/types";

interface TenantsClientProps {
  tenants: Tenant[];
  rooms: Room[];
  buildings: Building[];
}

export function TenantsClient({ tenants, rooms, buildings }: TenantsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | undefined>();
  const [deleteId, setDeleteId] = useState<{ id: string; roomId: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TenantFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: { status: "active", advance_paid: 0 },
  });

  const watchBuilding = watch("building_id");
  const availableRooms = rooms.filter(
    (r) => r.building_id === watchBuilding && (r.status === "vacant" || r.current_occupancy < r.capacity)
  );

  function openEdit(tenant: Tenant) {
    setEditTenant(tenant);
    reset({
      room_id: tenant.room_id,
      building_id: tenant.building_id,
      name: tenant.name,
      phone: tenant.phone,
      join_date: tenant.join_date,
      advance_paid: tenant.advance_paid,
      id_proof: tenant.id_proof ?? "",
      emergency_contact: tenant.emergency_contact ?? "",
      status: tenant.status,
    });
    setShowForm(true);
  }

  function onSubmit(values: TenantFormData) {
    startTransition(async () => {
      try {
        if (editTenant) {
          await updateTenant(editTenant.id, values, editTenant.room_id);
          toast.success("Tenant updated!");
        } else {
          await createTenant(values);
          toast.success("Tenant added!");
          reset({ status: "active", advance_paid: 0 });
        }
        setShowForm(false);
        setEditTenant(undefined);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteTenant(deleteId.id, deleteId.roomId);
        toast.success("Tenant removed");
        setDeleteId(null);
      } catch {
        toast.error("Failed to delete tenant");
      }
    });
  }

  const active = tenants.filter((t) => t.status === "active").length;
  const inactive = tenants.filter((t) => t.status === "inactive").length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tenants</h2>
          <p className="text-sm text-gray-500 mt-0.5">{active} active · {inactive} inactive</p>
        </div>
        <Button onClick={() => { setEditTenant(undefined); reset({ status: "active", advance_paid: 0 }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Tenant
        </Button>
      </div>

      {tenants.length === 0 ? (
        <EmptyState icon={Users} title="No tenants yet" description="Add tenants to rooms to start tracking rent payments." action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Tenant</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-sm">
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{tenant.name}</h3>
                    <Badge className={cn("text-xs capitalize mt-0.5", STATUS_COLORS[tenant.status])}>
                      {tenant.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(tenant)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId({ id: tenant.id, roomId: tenant.room_id })} className="text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tenant.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tenant.buildings?.name ?? "—"} · Room {tenant.rooms?.room_number ?? "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Joined {formatDate(tenant.join_date)}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
                <span className="text-gray-500">Advance Paid</span>
                <span className="font-semibold text-gray-700">{formatCurrency(tenant.advance_paid)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tenant Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditTenant(undefined); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTenant ? "Edit Tenant" : "Add Tenant"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="t-name">Full Name *</Label>
                <Input id="t-name" placeholder="Ahmed Khan" className="mt-1" {...register("name")} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="t-phone">Phone *</Label>
                <Input id="t-phone" placeholder="+91 9876543210" className="mt-1" {...register("phone")} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="t-join">Join Date *</Label>
                <Input id="t-join" type="date" className="mt-1" {...register("join_date")} />
                {errors.join_date && <p className="text-red-500 text-xs mt-1">{errors.join_date.message}</p>}
              </div>
              <div className="col-span-2">
                <Label>Building *</Label>
                <Select onValueChange={(v) => { setValue("building_id", v || ""); setValue("room_id", ""); }} defaultValue={editTenant?.building_id ?? undefined}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select building" /></SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.building_id && <p className="text-red-500 text-xs mt-1">{errors.building_id.message}</p>}
              </div>
              <div className="col-span-2">
                <Label>Room *</Label>
                <Select onValueChange={(v) => setValue("room_id", v || "")} defaultValue={editTenant?.room_id ?? undefined}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {(watchBuilding
                      ? rooms.filter((r) => r.building_id === watchBuilding)
                      : rooms
                    ).map((r) => (
                      <SelectItem key={r.id} value={r.id}>Room {r.room_number} ({formatCurrency(r.rent_amount)}/mo)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.room_id && <p className="text-red-500 text-xs mt-1">{errors.room_id.message}</p>}
              </div>
              <div>
                <Label htmlFor="t-advance">Advance Paid (₹)</Label>
                <Input id="t-advance" type="number" min={0} className="mt-1" {...register("advance_paid")} />
              </div>
              <div>
                <Label>Status</Label>
                <Select onValueChange={(v) => setValue("status", v as "active" | "inactive")} defaultValue={editTenant?.status ?? "active"}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="t-id">ID Proof Number</Label>
                <Input id="t-id" placeholder="Aadhar / PAN" className="mt-1" {...register("id_proof")} />
              </div>
              <div>
                <Label htmlFor="t-emergency">Emergency Contact</Label>
                <Input id="t-emergency" placeholder="+91 9876543210" className="mt-1" {...register("emergency_contact")} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editTenant ? "Save Changes" : "Add Tenant"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Remove Tenant"
        description="This will remove the tenant and update room occupancy. Rent records will be preserved."
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}
