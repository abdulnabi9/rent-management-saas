"use client";

import dynamic from "next/dynamic";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import type { MonthlyData } from "@/types";

const RentChart = dynamic(
  () => import("@/components/dashboard/RentChart").then((m) => m.RentChart),
  { loading: () => <PageLoader /> }
);
const OccupancyChart = dynamic(
  () => import("@/components/dashboard/OccupancyChart").then((m) => m.OccupancyChart),
  { loading: () => <PageLoader /> }
);
const IncomeExpenseChart = dynamic(
  () => import("@/components/dashboard/IncomeExpenseChart").then((m) => m.IncomeExpenseChart),
  { loading: () => <PageLoader /> }
);

interface DashboardChartsProps {
  rentByMonth: Record<number, number>;
  occupied: number;
  vacant: number;
  maintenance: number;
  yearlyExpenses: { date: string; amount: number }[];
}

export function DashboardCharts({ rentByMonth, occupied, vacant, maintenance, yearlyExpenses }: DashboardChartsProps) {
  // Convert expenses to month-based for IncomeExpenseChart
  const expenseWithMonth = yearlyExpenses.map((e) => ({
    month: new Date(e.date).getMonth() + 1,
    amount: e.amount,
  }));

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Rent Collection</h3>
          <RentChart data={rentByMonth} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Room Occupancy</h3>
          <OccupancyChart occupied={occupied} vacant={vacant} maintenance={maintenance} />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Income vs Expenses (This Year)</h3>
        <IncomeExpenseChart rentData={rentByMonth} expenseData={expenseWithMonth} />
      </div>
    </>
  );
}
