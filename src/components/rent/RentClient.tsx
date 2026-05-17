"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { rentPaymentSchema, type RentPaymentFormData } from "@/lib/validations";
import { createRentPayment, updateRentPayment } from "@/services/rent";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Plus, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn, STATUS_COLORS, formatCurrency, MONTHS, getCurrentMonthYear, getMonthName } from "@/lib/utils";
import type { RentPayment, Tenant } from "@/types";

interface RentClientProps {
  payments: RentPayment[];
  tenants: Tenant[];
}

export function RentClient({ payments, tenants }: RentClientProps) {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear] = useState(currentYear);
  const [showForm, setShowForm] = useState(false);
  const [editPayment, setEditPayment] = useState<RentPayment | undefined>();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<RentPaymentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(rentPaymentSchema) as any,
    defaultValues: { month: currentMonth, year: currentYear, status: "unpaid" },
  });

  const filteredPayments = payments.filter(
    (p) => p.month === selectedMonth && p.year === selectedYear
  );

  const totalCollected = filteredPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = filteredPayments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount, 0);

  function openEdit(payment: RentPayment) {
    setEditPayment(payment);
    reset({
      tenant_id: payment.tenant_id,
      room_id: payment.room_id,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      status: payment.status,
      paid_date: payment.paid_date ?? "",
      notes: payment.notes ?? "",
    });
    setShowForm(true);
  }

  function onSubmit(values: RentPaymentFormData) {
    startTransition(async () => {
      try {
        if (editPayment) {
          await updateRentPayment(editPayment.id, values);
          toast.success("Payment updated!");
        } else {
          await createRentPayment(values);
          toast.success("Payment recorded!");
          reset({ month: currentMonth, year: currentYear, status: "unpaid" });
        }
        setShowForm(false);
        setEditPayment(undefined);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  const selectedTenantId = watch("tenant_id");
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rent Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track monthly rent collection</p>
        </div>
        <Button onClick={() => { setEditPayment(undefined); reset({ month: selectedMonth, year: selectedYear, status: "unpaid" }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Collected</span>
          </div>
          <p className="text-xl font-bold text-emerald-800">{formatCurrency(totalCollected)}</p>
          <p className="text-xs text-emerald-600 mt-0.5">{filteredPayments.filter((p) => p.status === "paid").length} paid</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Pending</span>
          </div>
          <p className="text-xl font-bold text-orange-800">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-orange-600 mt-0.5">{filteredPayments.filter((p) => p.status !== "paid").length} due</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Month</span>
          </div>
          <p className="text-xl font-bold text-blue-800">{getMonthName(selectedMonth)}</p>
          <p className="text-xs text-blue-600 mt-0.5">{selectedYear}</p>
        </div>
      </div>

      {/* Month tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(i + 1)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              selectedMonth === i + 1
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={`No payments for ${getMonthName(selectedMonth)}`}
          description="Record a payment to track rent collection for this month."
          action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Record Payment</Button>}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Room</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Paid Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{payment.tenants?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">Room {payment.rooms?.room_number ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={cn("text-xs capitalize", STATUS_COLORS[payment.status])}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(payment)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Form */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditPayment(undefined); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editPayment ? "Edit Payment" : "Record Payment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label>Tenant *</Label>
              <Select
                onValueChange={(v) => {
                  setValue("tenant_id", v || "");
                  const t = tenants.find((t) => t.id === v);
                  if (t) {
                    setValue("room_id", t.room_id);
                    setValue("amount", t.rooms?.rent_amount ?? 0);
                  }
                }}
                defaultValue={editPayment?.tenant_id ?? undefined}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select tenant" /></SelectTrigger>
                <SelectContent>
                  {tenants.filter((t) => t.status === "active").map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — Room {t.rooms?.room_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenant_id && <p className="text-red-500 text-xs mt-1">{errors.tenant_id.message}</p>}
            </div>
            <input type="hidden" {...register("room_id")} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Month</Label>
                <Select onValueChange={(v) => setValue("month", Number(v))} defaultValue={String(editPayment?.month ?? selectedMonth)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-year">Year</Label>
                <Input id="p-year" type="number" className="mt-1" {...register("year")} />
              </div>
              <div>
                <Label htmlFor="p-amount">Amount (₹)</Label>
                <Input id="p-amount" type="number" min={0} className="mt-1" {...register("amount")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select onValueChange={(v) => setValue("status", v as RentPayment["status"])} defaultValue={editPayment?.status ?? "unpaid"}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-date">Paid Date</Label>
                <Input id="p-date" type="date" className="mt-1" {...register("paid_date")} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editPayment ? "Update" : "Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
