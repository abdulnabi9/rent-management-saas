import { Building2, BedDouble, Users, TrendingUp, TrendingDown, AlertCircle, DollarSign, Percent } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Occupancy Skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5"></div>
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm h-72"></div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm h-72"></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm h-80"></div>
    </div>
  );
}
