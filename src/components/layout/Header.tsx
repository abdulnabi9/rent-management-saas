"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, CreditCard, Receipt, Wrench, BarChart3, BedDouble } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/buildings", icon: Building2, label: "Buildings" },
  { href: "/rooms", icon: BedDouble, label: "Rooms" },
  { href: "/tenants", icon: Users, label: "Tenants" },
  { href: "/rent", icon: CreditCard, label: "Rent" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/maintenance", icon: Wrench, label: "Maintenance" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/profile", label: "Profile" },
];

interface HeaderProps {
  userEmail: string;
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();

  const currentPage = NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-40">
      <h1 className="text-base font-semibold text-gray-900 md:text-lg">
        {currentPage?.label ?? "Dashboard"}
      </h1>

      <div className="hidden md:block text-sm text-gray-500 font-medium">{userEmail}</div>
      <div className="md:hidden w-8" /> {/* spacer for balance if needed */}
    </header>
  );
}
