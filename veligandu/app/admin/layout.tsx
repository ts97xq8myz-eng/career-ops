"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, DollarSign, Home, Megaphone,
  FileText, LogOut
} from "lucide-react";

const NAV = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/admin/leads",     label: "Leads",       icon: Users },
  { href: "/admin/rates",     label: "Rates",       icon: DollarSign },
  { href: "/admin/villas",    label: "Villas",      icon: Home },
  { href: "/admin/campaigns", label: "Campaigns",   icon: Megaphone },
  { href: "/admin/audit",     label: "Audit Log",   icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const { getClientAuth } = await import("@/lib/firebase/client");
    const { signOut }       = await import("firebase/auth");
    await signOut(getClientAuth());
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[var(--color-ocean)] flex flex-col min-h-screen fixed left-0 top-0 z-40">
        {/* Brand */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)] flex items-center justify-center flex-shrink-0">
              <span className="font-serif text-xs font-black text-white">R&amp;S</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[8px] font-semibold text-white/40 uppercase tracking-[0.2em]">Reservations &amp; Sales</span>
              <span className="font-serif text-sm font-bold text-white">VELIGANDU</span>
              <span className="text-[var(--color-gold)] text-[8px] tracking-[0.2em] uppercase">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-white/15 text-white border-r-2 border-[var(--color-gold)]"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex flex-col gap-3">
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            ← Back to site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-60 flex-1 min-h-screen">
        {children}
      </div>
    </div>
  );
}
