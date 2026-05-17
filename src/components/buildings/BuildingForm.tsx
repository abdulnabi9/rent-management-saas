"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { buildingSchema, type BuildingFormData } from "@/lib/validations";
import { createBuilding, updateBuilding } from "@/services/buildings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Building } from "@/types";

interface BuildingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building?: Building;
}

export function BuildingForm({ open, onOpenChange, building }: BuildingFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuildingFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(buildingSchema) as any,
    defaultValues: building
      ? {
          name: building.name,
          address: building.address,
          total_floors: building.total_floors,
          total_units: building.total_units,
          notes: building.notes ?? "",
        }
      : { total_floors: 1, total_units: 1 },
  });

  function onSubmit(values: BuildingFormData) {
    startTransition(async () => {
      try {
        if (building) {
          await updateBuilding(building.id, values);
          toast.success("Building updated!");
        } else {
          await createBuilding(values);
          toast.success("Building added!");
          reset();
        }
        onOpenChange(false);
      } catch (err: unknown) {
        console.error("BUILDING_INSERT_ERROR:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        toast.error(`Failed to save building: ${errorMsg}`);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{building ? "Edit Building" : "Add Building"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Building Name *</Label>
              <Input id="name" placeholder="Green Heights" className="mt-1" {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input id="address" placeholder="123 Main Street, City" className="mt-1" {...register("address")} />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="total_floors">Number of Floors *</Label>
                <Input id="total_floors" type="number" min={1} className="mt-1" {...register("total_floors")} />
                {errors.total_floors && <p className="text-red-500 text-xs mt-1">{errors.total_floors.message}</p>}
              </div>
              <div>
                <Label htmlFor="total_units">Total Units *</Label>
                <Input id="total_units" type="number" min={1} className="mt-1" {...register("total_units")} />
                {errors.total_units && <p className="text-red-500 text-xs mt-1">{errors.total_units.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Optional notes..." className="mt-1 resize-none" rows={3} {...register("notes")} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {building ? "Save Changes" : "Add Building"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
