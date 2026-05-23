import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/shared/StatsCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Building2, BedDouble, Users, TrendingUp, TrendingDown, AlertCircle, DollarSign } from "lucide-react";
import { formatCurrency, getCurrentMonthYear } from "@/lib/utils";
import { Percent } from "lucide-react";

async function getDashboardData(userId: string) {
  const supabase = await createClient();
  const { month, year } = getCurrentMonthYear();

  const [buildings, rooms, tenants, rentPayments, expenses, yearlyRent, yearlyExpenses] =
    await Promise.all([
      supabase.from("buildings").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("rooms").select("status").eq("user_id", userId),
      supabase.from("tenants").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
      supabase
        .from("rent_payments")
        .select("amount, status")
        .eq("user_id", userId)
        .eq("month", month)
        .eq("year", year),
      supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", userId)
        .gte("date", `${year}-${String(month).padStart(2, "0")}-01`)
        .lte("date", new Date(year, month, 0).toISOString().split("T")[0]),
      supabase
        .from("rent_payments")
        .select("month, amount")
        .eq("user_id", userId)
        .eq("year", year)
        .eq("status", "paid"),
      supabase
        .from("expenses")
        .select("date, amount")
        .eq("user_id", userId)
        .gte("date", `${year}-01-01`)
        .lte("date", `${year}-12-31`),
    ]);

  const roomData = rooms.data ?? [];
  const occupied = roomData.filter((r) => r.status === "occupied").length;
  const vacant = roomData.filter((r) => r.status === "vacant").length;
  const maintenance = roomData.filter((r) => r.status === "maintenance").length;
  const total = roomData.length;

  const monthlyIncome = (rentPayments.data ?? [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const pendingDues = (rentPayments.data ?? [])
    .filter((p) => p.status === "unpaid" || p.status === "partial")
    .reduce((s, p) => s + p.amount, 0);
  const monthlyExpenses = (expenses.data ?? []).reduce((s, e) => s + e.amount, 0);

  const rentByMonth: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) rentByMonth[i] = 0;
  (yearlyRent.data ?? []).forEach((p) => {
    rentByMonth[p.month] = (rentByMonth[p.month] || 0) + p.amount;
  });

  return {
    totalBuildings: buildings.count ?? 0,
    totalRooms: total,
    occupiedRooms: occupied,
    vacantRooms: vacant,
    maintenanceRooms: maintenance,
    activeTenants: tenants.count ?? 0,
    monthlyIncome,
    monthlyExpenses,
    pendingDues,
    profitLoss: monthlyIncome - monthlyExpenses,
    occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    rentByMonth,
    yearlyExpenses: yearlyExpenses.data ?? [],
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const stats = await getDashboardData(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Your rental portfolio at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Buildings" value={stats.totalBuildings} icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Total Rooms" value={stats.totalRooms} icon={BedDouble} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatsCard title="Occupied" value={stats.occupiedRooms} subtitle={`${stats.occupancyRate}% occupancy`} icon={Users} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Vacant" value={stats.vacantRooms} icon={BedDouble} iconColor="text-gray-500" iconBg="bg-gray-100" />
        <StatsCard title="Monthly Income" value={formatCurrency(stats.monthlyIncome)} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatsCard title="Monthly Expenses" value={formatCurrency(stats.monthlyExpenses)} icon={TrendingDown} iconColor="text-red-500" iconBg="bg-red-50" />
        <StatsCard title="Pending Dues" value={formatCurrency(stats.pendingDues)} icon={AlertCircle} iconColor="text-orange-500" iconBg="bg-orange-50" />
        <StatsCard
          title="Profit / Loss"
          value={formatCurrency(stats.profitLoss)}
          icon={stats.profitLoss >= 0 ? DollarSign : TrendingDown}
          iconColor={stats.profitLoss >= 0 ? "text-green-600" : "text-red-500"}
          iconBg={stats.profitLoss >= 0 ? "bg-green-50" : "bg-red-50"}
        />
      </div>

      {/* Occupancy progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Occupancy Rate</span>
          </div>
          <span className="text-sm font-bold text-blue-600">{stats.occupancyRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${stats.occupancyRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{stats.occupiedRooms} occupied</span>
          <span>{stats.vacantRooms} vacant</span>
        </div>
      </div>

      {/* Charts (client component) */}
      <DashboardCharts
        rentByMonth={stats.rentByMonth}
        occupied={stats.occupiedRooms}
        vacant={stats.vacantRooms}
        maintenance={stats.maintenanceRooms}
        yearlyExpenses={stats.yearlyExpenses as { date: string; amount: number }[]}
      />
    </div>
  );
}
