"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, DollarSign, Home, Megaphone,
  FileText, LogOut
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/rates", label: "Rates", icon: DollarSign },
  { href: "/admin/villas", label: "Villas", icon: Home },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/audit", label: "Audit Log", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const { getClientAuth } = await import("@/lib/firebase/client");
    const { signOut } = await import("firebase/auth");
    await signOut(getClientAuth());
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--color-ocean)] flex flex-col min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-white/10">
          <span className="font-serif text-lg font-bold text-white block">VELIGANDU</span>
          <span className="text-[var(--color-gold)] text-xs tracking-[0.2em] uppercase">Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-white/15 text-white border-r-2 border-[var(--color-gold)]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-white/60 hover:text-white border-t border-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <div className="ml-56 flex-1 min-h-screen">
        {children}
      </div>
    </div>
  );
}
