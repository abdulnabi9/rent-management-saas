"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { maintenanceSchema, type MaintenanceFormData } from "@/lib/validations";
import { createMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest, updateMaintenanceStatus } from "@/services/maintenance";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wrench, Plus, MoreVertical, Pencil, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { cn, PRIORITY_COLORS, STATUS_COLORS, formatDate } from "@/lib/utils";
import type { MaintenanceRequest, Building, Room } from "@/types";

interface MaintenanceClientProps {
  requests: MaintenanceRequest[];
  buildings: Building[];
  rooms: Room[];
}

export function MaintenanceClient({ requests, buildings, rooms }: MaintenanceClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editReq, setEditReq] = useState<MaintenanceRequest | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MaintenanceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(maintenanceSchema) as any,
    defaultValues: { priority: "medium", status: "open" },
  });

  const watchBuilding = watch("building_id");
  const buildingRooms = rooms.filter((r) => r.building_id === watchBuilding);

  const filtered = filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus);

  function openEdit(req: MaintenanceRequest) {
    setEditReq(req);
    reset({
      building_id: req.building_id,
      room_id: req.room_id ?? undefined,
      title: req.title,
      description: req.description ?? "",
      priority: req.priority,
      status: req.status,
    });
    setShowForm(true);
  }

  function onSubmit(values: MaintenanceFormData) {
    startTransition(async () => {
      try {
        if (editReq) {
          await updateMaintenanceRequest(editReq.id, values);
          toast.success("Request updated!");
        } else {
          await createMaintenanceRequest(values);
          toast.success("Request created!");
          reset({ priority: "medium", status: "open" });
        }
        setShowForm(false);
        setEditReq(undefined);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteMaintenanceRequest(deleteId);
        toast.success("Request deleted");
        setDeleteId(null);
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  function markResolved(id: string) {
    startTransition(async () => {
      try {
        await updateMaintenanceStatus(id, "resolved");
        toast.success("Marked as resolved");
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  const open = requests.filter((r) => r.status === "open").length;
  const inProgress = requests.filter((r) => r.status === "in_progress").length;
  const resolved = requests.filter((r) => r.status === "resolved").length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Maintenance</h2>
          <p className="text-sm text-gray-500 mt-0.5">{open} open · {inProgress} in progress · {resolved} resolved</p>
        </div>
        <Button onClick={() => { setEditReq(undefined); reset({ priority: "medium", status: "open" }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {[
          { value: "all", label: `All (${requests.length})` },
          { value: "open", label: `Open (${open})` },
          { value: "in_progress", label: `In Progress (${inProgress})` },
          { value: "resolved", label: `Resolved (${resolved})` },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filterStatus === f.value ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests"
          description="Create a maintenance request to track issues in your buildings."
          action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />New Request</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{req.title}</h3>
                      <Badge className={cn("text-xs capitalize", PRIORITY_COLORS[req.priority])}>{req.priority}</Badge>
                      <Badge className={cn("text-xs capitalize", STATUS_COLORS[req.status])}>{req.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {req.buildings?.name ?? "—"}{req.rooms ? ` · Room ${req.rooms.room_number}` : ""}
                    </p>
                    {req.description && <p className="text-xs text-gray-400 line-clamp-2">{req.description}</p>}
                    <p className="text-xs text-gray-300 mt-1">{formatDate(req.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {req.status !== "resolved" && (
                    <button
                      onClick={() => markResolved(req.id)}
                      disabled={isPending}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark resolved"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(req)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(req.id)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditReq(undefined); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editReq ? "Edit Request" : "New Maintenance Request"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label>Building *</Label>
              <Select onValueChange={(v) => { setValue("building_id", v || ""); setValue("room_id", ""); }} defaultValue={editReq?.building_id ?? undefined}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select building" /></SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.building_id && <p className="text-red-500 text-xs mt-1">{errors.building_id.message}</p>}
            </div>
            <div>
              <Label>Room (optional)</Label>
              <Select onValueChange={(v) => setValue("room_id", v || "")} defaultValue={editReq?.room_id ?? ""}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select room (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {buildingRooms.map((r) => <SelectItem key={r.id} value={r.id}>Room {r.room_number}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="m-title">Title *</Label>
              <Input id="m-title" placeholder="e.g. Leaking pipe in bathroom" className="mt-1" {...register("title")} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="m-desc">Description</Label>
              <Textarea id="m-desc" placeholder="Detailed description..." className="mt-1 resize-none" rows={3} {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select onValueChange={(v) => setValue("priority", v as MaintenanceRequest["priority"])} defaultValue={editReq?.priority ?? "medium"}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select onValueChange={(v) => setValue("status", v as MaintenanceRequest["status"])} defaultValue={editReq?.status ?? "open"}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editReq ? "Save Changes" : "Create Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Request"
        description="Are you sure you want to delete this maintenance request?"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}
