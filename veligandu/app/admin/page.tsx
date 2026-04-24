"use client";

import Link from "next/link";
import { Users, DollarSign, TrendingUp, Eye } from "lucide-react";

const STATS = [
  { label: "Total Leads (30d)", value: "47", change: "+12%", icon: Users, color: "bg-blue-50 text-blue-700" },
  { label: "Conversion Rate", value: "18.3%", change: "+2.1%", icon: TrendingUp, color: "bg-green-50 text-green-700" },
  { label: "Pipeline Value", value: "$124,500", change: "+$8,200", icon: DollarSign, color: "bg-gold-50 text-[var(--color-gold-dark)]" },
  { label: "Page Views (7d)", value: "3,247", change: "+18%", icon: Eye, color: "bg-purple-50 text-purple-700" },
];

const RECENT_LEADS = [
  { id: "1", name: "James Carter", email: "james@example.com", villa: "Overwater Villa", checkIn: "2025-06-15", status: "new" },
  { id: "2", name: "Sophie Laurent", email: "sophie@example.com", villa: "Honeymoon Suite", checkIn: "2025-07-01", status: "contacted" },
  { id: "3", name: "Akira Tanaka", email: "akira@example.com", villa: "Sunset Overwater", checkIn: "2025-06-20", status: "new" },
  { id: "4", name: "Priya Patel", email: "priya@example.com", villa: "Beach Villa", checkIn: "2025-08-10", status: "quoted" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  quoted: "bg-purple-100 text-purple-700",
  confirmed: "bg-green-100 text-green-700",
};

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)] mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back. Here&apos;s your booking overview.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-bold text-2xl text-[var(--color-ocean)]">{s.value}</p>
              <p className="text-xs text-green-600 mt-1">{s.change} vs last period</p>
            </div>
          );
        })}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-ocean)]">Recent Leads</h2>
          <Link href="/admin/leads" className="text-sm text-[var(--color-gold)] hover:text-[var(--color-gold-dark)]">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Villa</th>
                <th className="px-5 py-3 font-medium">Check-in</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_LEADS.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[var(--color-ocean)]">{lead.name}</p>
                    <p className="text-gray-400 text-xs">{lead.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{lead.villa}</td>
                  <td className="px-5 py-3.5 text-gray-600">{lead.checkIn}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/leads?id=${lead.id}`} className="text-[var(--color-gold)] text-xs font-medium hover:text-[var(--color-gold-dark)]">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
