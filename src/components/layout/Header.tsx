"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, DoorOpen, LayoutDashboard, Building2, Users, CreditCard, Receipt, Wrench, BarChart3, LogOut, BedDouble } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/buildings", icon: Building2, label: "Buildings" },
  { href: "/rooms", icon: BedDouble, label: "Rooms" },
  { href: "/tenants", icon: Users, label: "Tenants" },
  { href: "/rent", icon: CreditCard, label: "Rent" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/maintenance", icon: Wrench, label: "Maintenance" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
];

interface HeaderProps {
  userEmail: string;
}

export function Header({ userEmail }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <h1 className="text-base font-semibold text-gray-900 md:text-lg">
          {currentPage?.label ?? "Dashboard"}
        </h1>

        <div className="hidden md:block text-sm text-gray-500">{userEmail}</div>
        <div className="md:hidden w-8" /> {/* spacer */}
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-900 text-white flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">RentFlow</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-slate-700">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm text-slate-200 truncate">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
