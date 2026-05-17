"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MONTHS } from "@/lib/utils";

interface IncomeExpenseChartProps {
  rentData: Record<number, number>;
  expenseData: { month: number; amount: number }[];
}

export function IncomeExpenseChart({ rentData, expenseData }: IncomeExpenseChartProps) {
  // Build monthly expense totals
  const expenseByMonth: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) expenseByMonth[i] = 0;
  expenseData.forEach((e) => {
    const m = Number(new Date(e.month).toISOString().split("-")[1]);
    expenseByMonth[m] = (expenseByMonth[m] || 0) + e.amount;
  });

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: MONTHS[i].slice(0, 3),
    income: rentData[i + 1] ?? 0,
    expenses: expenseByMonth[i + 1] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [
            `₹${Number(value).toLocaleString("en-IN")}`,
            name === "income" ? "Income" : "Expenses",
          ]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
