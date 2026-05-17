import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/reports/PrintButton";
import { formatCurrency, getMonthName, MONTHS } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, Building2, Users } from "lucide-react";

export const metadata = { title: "Reports — RentFlow" };

async function getReportData() {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();

  const [buildings, rooms, tenants, rentPayments, expenses] = await Promise.all([
    supabase.from("buildings").select("id, name"),
    supabase.from("rooms").select("status"),
    supabase.from("tenants").select("id, status"),
    supabase.from("rent_payments").select("month, year, amount, status").eq("year", year),
    supabase.from("expenses").select("date, amount, category").gte("date", `${year}-01-01`).lte("date", `${year}-12-31`),
  ]);

  // Monthly rent summary
  const rentByMonth: Record<number, { collected: number; pending: number }> = {};
  for (let i = 1; i <= 12; i++) rentByMonth[i] = { collected: 0, pending: 0 };
  (rentPayments.data ?? []).forEach((p) => {
    if (p.status === "paid") rentByMonth[p.month].collected += p.amount;
    else rentByMonth[p.month].pending += p.amount;
  });

  // Monthly expense summary
  const expenseByMonth: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) expenseByMonth[i] = 0;
  (expenses.data ?? []).forEach((e) => {
    const m = new Date(e.date).getMonth() + 1;
    expenseByMonth[m] += e.amount;
  });

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  (expenses.data ?? []).forEach((e) => {
    categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
  });

  const totalCollected = Object.values(rentByMonth).reduce((s, m) => s + m.collected, 0);
  const totalExpenses = Object.values(expenseByMonth).reduce((s, v) => s + v, 0);

  return {
    year,
    totalBuildings: (buildings.data ?? []).length,
    totalRooms: (rooms.data ?? []).length,
    occupiedRooms: (rooms.data ?? []).filter((r) => r.status === "occupied").length,
    activeTenants: (tenants.data ?? []).filter((t) => t.status === "active").length,
    totalCollected,
    totalExpenses,
    netProfit: totalCollected - totalExpenses,
    rentByMonth,
    expenseByMonth,
    categoryBreakdown,
  };
}

export default async function ReportsPage() {
  const data = await getReportData();
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">Annual summary for {data.year}</p>
        </div>
        <PrintButton />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Total Buildings", value: data.totalBuildings, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Active Tenants", value: data.activeTenants, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
          { title: "Occupancy Rate", value: `${data.totalRooms > 0 ? Math.round((data.occupiedRooms / data.totalRooms) * 100) : 0}%`, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Net Profit/Loss", value: formatCurrency(data.netProfit), icon: data.netProfit >= 0 ? TrendingUp : TrendingDown, color: data.netProfit >= 0 ? "text-emerald-600" : "text-red-500", bg: data.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50" },
        ].map(({ title, value, icon: Icon, color, bg }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Annual Income Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-700">Monthly Income & Expense Report — {data.year}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Month</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Collected</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Pending</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Expenses</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MONTHS.map((month, i) => {
                const m = i + 1;
                const rent = data.rentByMonth[m];
                const exp = data.expenseByMonth[m];
                const net = rent.collected - exp;
                const isCurrentMonth = m === currentMonth;
                return (
                  <tr key={month} className={`hover:bg-gray-50 transition-colors ${isCurrentMonth ? "bg-blue-50/30" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {month.slice(0, 3)}
                      {isCurrentMonth && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Current</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-medium">{formatCurrency(rent.collected)}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(rent.pending)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatCurrency(exp)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${net >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {net >= 0 ? "+" : ""}{formatCurrency(net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-4 py-3 font-bold text-gray-900 text-xs">TOTAL</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(data.totalCollected)}</td>
                <td className="px-4 py-3 text-right font-bold text-orange-600">{formatCurrency(Object.values(data.rentByMonth).reduce((s, m) => s + m.pending, 0))}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(data.totalExpenses)}</td>
                <td className={`px-4 py-3 text-right font-bold ${data.netProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {data.netProfit >= 0 ? "+" : ""}{formatCurrency(data.netProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Expense by Category */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Expense Category Breakdown — {data.year}</h3>
        <div className="space-y-3">
          {Object.entries(data.categoryBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amt]) => {
              const pct = data.totalExpenses > 0 ? Math.round((amt / data.totalExpenses) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize font-medium text-gray-700">{cat}</span>
                    <span className="text-gray-500">{formatCurrency(amt)} · {pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          {Object.keys(data.categoryBreakdown).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No expenses recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
