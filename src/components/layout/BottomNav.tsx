"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, BedDouble, Users, Receipt, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/buildings", icon: Building2, label: "Builds" },
  { href: "/rooms", icon: BedDouble, label: "Rooms" },
  { href: "/tenants", icon: Users, label: "Tenants" },
  { href: "/expenses", icon: Receipt, label: "Exp." },
  { href: "/profile", icon: UserCircle, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                active ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "fill-blue-100" : "")} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
