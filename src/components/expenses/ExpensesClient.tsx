"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations";
import { createExpense, updateExpense, deleteExpense } from "@/services/expenses";
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
import { Receipt, Plus, MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, getCurrentMonthYear, getMonthName, MONTHS } from "@/lib/utils";
import type { Expense, Building } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  electricity: "bg-yellow-100 text-yellow-800",
  water: "bg-blue-100 text-blue-800",
  maintenance: "bg-gray-100 text-gray-800",
  repair: "bg-orange-100 text-orange-800",
  salary: "bg-purple-100 text-purple-800",
  other: "bg-slate-100 text-slate-800",
};

interface ExpensesClientProps {
  expenses: Expense[];
  buildings: Building[];
}

export function ExpensesClient({ expenses, buildings }: ExpensesClientProps) {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: { category: "other", date: new Date().toISOString().split("T")[0] },
  });

  const filteredExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === currentYear;
  });

  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const breakdown: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
  });

  function openEdit(expense: Expense) {
    setEditExpense(expense);
    reset({
      building_id: expense.building_id,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description ?? "",
    });
    setShowForm(true);
  }

  function onSubmit(values: ExpenseFormData) {
    startTransition(async () => {
      try {
        if (editExpense) {
          await updateExpense(editExpense.id, values);
          toast.success("Expense updated!");
        } else {
          await createExpense(values);
          toast.success("Expense added!");
          reset({ category: "other", date: new Date().toISOString().split("T")[0] });
        }
        setShowForm(false);
        setEditExpense(undefined);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteExpense(deleteId);
        toast.success("Expense deleted");
        setDeleteId(null);
      } catch {
        toast.error("Failed to delete expense");
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track all building expenses</p>
        </div>
        <Button onClick={() => { setEditExpense(undefined); reset({ category: "other", date: new Date().toISOString().split("T")[0] }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </div>

      {/* Summary + Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium mb-1">{getMonthName(selectedMonth)} Expenses</p>
          <p className="text-2xl font-bold text-red-800">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-red-500 mt-1">{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-600 mb-3">Category Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(breakdown).map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-2">
                <Badge className={`text-xs capitalize ${CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-800"}`}>{cat}</Badge>
                <span className="text-xs font-medium text-gray-700">{formatCurrency(amt)}</span>
              </div>
            ))}
            {Object.keys(breakdown).length === 0 && <p className="text-xs text-gray-400">No expenses this month</p>}
          </div>
        </div>
      </div>

      {/* Month tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(i + 1)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedMonth === i + 1 ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {filteredExpenses.length === 0 ? (
        <EmptyState icon={Receipt} title={`No expenses for ${getMonthName(selectedMonth)}`} description="Add an expense to track costs for this month." action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" />Add Expense</Button>} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Building</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(expense.date)}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs capitalize ${CATEGORY_COLORS[expense.category] ?? ""}`}>{expense.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{expense.buildings?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{expense.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(expense)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(expense.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Form */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditExpense(undefined); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label>Building *</Label>
              <Select onValueChange={(v) => setValue("building_id", v || "")} defaultValue={editExpense?.building_id ?? undefined}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select building" /></SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.building_id && <p className="text-red-500 text-xs mt-1">{errors.building_id.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category *</Label>
                <Select onValueChange={(v) => setValue("category", v as Expense["category"])} defaultValue={editExpense?.category ?? "other"}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="e-amount">Amount (₹) *</Label>
                <Input id="e-amount" type="number" min={0} className="mt-1" {...register("amount")} />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="e-date">Date *</Label>
              <Input id="e-date" type="date" className="mt-1" {...register("date")} />
            </div>
            <div>
              <Label htmlFor="e-desc">Description</Label>
              <Textarea id="e-desc" placeholder="Optional description..." className="mt-1 resize-none" rows={2} {...register("description")} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editExpense ? "Save Changes" : "Add Expense"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense?"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}
