"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";

const MOCK_LEADS = [
  { id: "lead_001", fullName: "James Carter", email: "james@example.com", phone: "+44 7700 900123", country: "UK", villaCategory: "overwater", checkIn: "2025-06-15", checkOut: "2025-06-22", adults: 2, children: 0, budget: "500-1000", status: "new", selectedRate: 850, createdAt: "2025-04-01" },
  { id: "lead_002", fullName: "Sophie Laurent", email: "sophie@example.com", phone: "+33 6 12 34 56 78", country: "France", villaCategory: "honeymoon", checkIn: "2025-07-01", checkOut: "2025-07-10", adults: 2, children: 0, budget: "over-1500", status: "contacted", selectedRate: 1400, createdAt: "2025-04-02" },
  { id: "lead_003", fullName: "Akira Tanaka", email: "akira@example.com", phone: "+81 90 1234 5678", country: "Japan", villaCategory: "sunset-overwater", checkIn: "2025-06-20", checkOut: "2025-06-27", adults: 2, children: 1, budget: "1000-1500", status: "new", selectedRate: 1100, createdAt: "2025-04-03" },
  { id: "lead_004", fullName: "Priya Patel", email: "priya@example.com", phone: "+91 98765 43210", country: "India", villaCategory: "beach", checkIn: "2025-08-10", checkOut: "2025-08-17", adults: 2, children: 2, budget: "500-1000", status: "quoted", selectedRate: 650, createdAt: "2025-04-04" },
];

const STATUS_OPTIONS = ["all", "new", "contacted", "quoted", "confirmed", "cancelled"];

export default function AdminLeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = MOCK_LEADS.filter((l) => {
    const matchSearch =
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Country", "Villa", "Check-in", "Check-out", "Rate/night", "Status", "Created"];
    const rows = filtered.map((l) => [
      l.id, l.fullName, l.email, l.phone, l.country, l.villaCategory,
      l.checkIn, l.checkOut, `$${l.selectedRate}`, l.status, l.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veligandu-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)]">Leads</h1>
          <p className="text-gray-500 mt-1">{filtered.length} enquiries</p>
        </div>
        <Button variant="secondary" size="md" onClick={exportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors capitalize ${
                statusFilter === s
                  ? "bg-[var(--color-ocean)] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Guest</th>
              <th className="px-5 py-3 font-medium">Villa</th>
              <th className="px-5 py-3 font-medium">Dates</th>
              <th className="px-5 py-3 font-medium">Rate</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-[var(--color-ocean)]">{lead.fullName}</p>
                  <p className="text-gray-400 text-xs">{lead.email}</p>
                  <p className="text-gray-400 text-xs">{lead.country}</p>
                </td>
                <td className="px-5 py-3.5 text-gray-600 capitalize">{lead.villaCategory.replace("-", " ")}</td>
                <td className="px-5 py-3.5">
                  <p className="text-gray-600 text-xs">{lead.checkIn}</p>
                  <p className="text-gray-400 text-xs">→ {lead.checkOut}</p>
                  <p className="text-gray-400 text-xs">{lead.adults}A / {lead.children}C</p>
                </td>
                <td className="px-5 py-3.5 font-semibold text-[var(--color-ocean)]">
                  ${lead.selectedRate}/night
                </td>
                <td className="px-5 py-3.5">
                  <Badge
                    variant={
                      lead.status === "new" ? "available" :
                      lead.status === "quoted" ? "gold" :
                      lead.status === "confirmed" ? "available" :
                      "limited"
                    }
                  >
                    {lead.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{lead.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
