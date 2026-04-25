"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, limit, doc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Search, Download, Mail, MessageCircle, TrendingUp, Users, DollarSign, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface LeadDoc {
  id:               string;
  fullName:         string;
  email:            string;
  phone:            string;
  country:          string;
  villaCategory:    string;
  checkIn:          string;
  checkOut:         string;
  adults:           number;
  children:         number;
  status:           string;
  preferredContact: "email" | "whatsapp";
  selectedRate?:    number;
  quote?: {
    nights:            number;
    directTotal:       number;
    savingsValue:      number;
    savingsPercent:    number;
    publicNightlyRate: number;
    directNightlyRate: number;
  };
  message?:         string;
  utmSource?:       string;
  createdAt?:       Date;
}

const STATUS_OPTIONS = ["all", "new", "contacted", "quoted", "confirmed", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  quoted:    "bg-purple-100 text-purple-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const NEXT_STATUS: Record<string, string> = {
  new:       "contacted",
  contacted: "quoted",
  quoted:    "confirmed",
};

export default function AdminLeadsPage() {
  const [leads, setLeads]           = useState<LeadDoc[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [updating, setUpdating]     = useState<string | null>(null);

  // Subscribe to leads in real time
  useEffect(() => {
    const q = query(
      collection(getDb(), "leads"),
      orderBy("createdAt", "desc"),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      setLeads(snap.docs.map((d) => {
        const data = d.data();
        return {
          id:               d.id,
          fullName:         data.fullName         ?? "—",
          email:            data.email            ?? "—",
          phone:            data.phone            ?? "—",
          country:          data.country          ?? "—",
          villaCategory:    data.villaCategory    ?? "—",
          checkIn:          data.checkIn          ?? "—",
          checkOut:         data.checkOut         ?? "—",
          adults:           data.adults           ?? 2,
          children:         data.children         ?? 0,
          status:           data.status           ?? "new",
          preferredContact: data.preferredContact ?? "email",
          selectedRate:     data.selectedRate,
          quote:            data.quote,
          message:          data.message,
          utmSource:        data.utmSource,
          createdAt:        data.createdAt?.toDate?.() ?? undefined,
        };
      }));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, []);

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.villaCategory.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Metrics ────────────────────────────────────────────────────────────────
  const total     = leads.length;
  const confirmed = leads.filter((l) => l.status === "confirmed").length;
  const pipeline  = leads
    .filter((l) => l.quote?.directTotal)
    .reduce((sum, l) => sum + (l.quote?.directTotal ?? 0), 0);
  const convRate  = total > 0 ? ((confirmed / total) * 100).toFixed(1) : "0.0";

  const advanceStatus = async (lead: LeadDoc) => {
    const next = NEXT_STATUS[lead.status];
    if (!next) return;
    setUpdating(lead.id);
    try {
      await updateDoc(doc(getDb(), "leads", lead.id), { status: next, updatedAt: new Date() });
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Country", "Villa", "Check-in", "Check-out", "Nights", "Guests", "Direct Total", "Savings", "Status", "Contact", "UTM", "Created"];
    const rows = filtered.map((l) => [
      l.id, l.fullName, l.email, l.phone, l.country, l.villaCategory,
      l.checkIn, l.checkOut,
      l.quote?.nights ?? "",
      `${l.adults}A/${l.children}C`,
      l.quote?.directTotal ? `$${Math.round(l.quote.directTotal)}` : "",
      l.quote?.savingsValue ? `$${Math.round(l.quote.savingsValue)}` : "",
      l.status, l.preferredContact,
      l.utmSource ?? "",
      l.createdAt?.toISOString().split("T")[0] ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `veligandu-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)]">Leads</h1>
          <p className="text-gray-500 mt-1 text-sm">Real-time from Firestore · {total} total</p>
        </div>
        <Button variant="secondary" size="md" onClick={exportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Leads",      value: String(total),         icon: Users,      color: "text-blue-600 bg-blue-50" },
          { label: "Conversion Rate",  value: `${convRate}%`,        icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pipeline Value",   value: formatCurrency(pipeline), icon: DollarSign, color: "text-[var(--color-gold)] bg-[var(--color-sand)]" },
          { label: "Confirmed",        value: String(confirmed),     icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">{label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-ocean)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, villa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
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
              {s === "all" ? `All (${total})` : `${s} (${leads.filter((l) => l.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading leads from Firestore…
        </div>
      )}

      {/* Leads list */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No leads found</p>
              <p className="text-sm mt-1">Leads submitted via the booking form appear here in real time.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((lead) => {
                const isExpanded = expanded === lead.id;
                const nights = lead.quote?.nights ??
                  Math.max(1, Math.round((new Date(lead.checkOut).getTime() - new Date(lead.checkIn).getTime()) / 86_400_000));

                return (
                  <div key={lead.id} className="hover:bg-gray-50 transition-colors">
                    {/* Main row */}
                    <div className="px-5 py-4 grid grid-cols-12 gap-3 items-center">
                      {/* Guest */}
                      <div className="col-span-12 sm:col-span-3">
                        <p className="font-semibold text-[var(--color-ocean)] text-sm">{lead.fullName}</p>
                        <p className="text-gray-400 text-xs">{lead.email}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {lead.preferredContact === "whatsapp"
                            ? <MessageCircle className="w-3 h-3 text-green-500" />
                            : <Mail className="w-3 h-3 text-blue-400" />
                          }
                          <span className="text-xs text-gray-400">{lead.country}</span>
                        </div>
                      </div>

                      {/* Villa + dates */}
                      <div className="col-span-6 sm:col-span-2">
                        <p className="text-sm text-[var(--color-ocean)] font-medium capitalize">
                          {lead.villaCategory.replace("-", " ")}
                        </p>
                        <p className="text-xs text-gray-400">{lead.checkIn}</p>
                        <p className="text-xs text-gray-400">→ {lead.checkOut} · {nights}n</p>
                      </div>

                      {/* Quote */}
                      <div className="col-span-6 sm:col-span-3">
                        {lead.quote ? (
                          <>
                            <p className="text-sm font-bold text-[var(--color-ocean)]">
                              {formatCurrency(lead.quote.directTotal)}
                            </p>
                            <p className="text-xs text-gray-400">{nights}n all-inclusive</p>
                            <p className="text-xs text-emerald-600 mt-0.5">
                              Saves {formatCurrency(lead.quote.savingsValue)} vs OTA
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">
                            {lead.selectedRate ? `${formatCurrency(lead.selectedRate)}/night` : "—"}
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-6 sm:col-span-2 flex flex-col gap-1.5">
                        <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {lead.status}
                        </span>
                        {NEXT_STATUS[lead.status] && (
                          <button
                            onClick={() => advanceStatus(lead)}
                            disabled={updating === lead.id}
                            className="text-[10px] text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] font-semibold flex items-center gap-1"
                          >
                            {updating === lead.id ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : null}
                            → Mark {NEXT_STATUS[lead.status]}
                          </button>
                        )}
                      </div>

                      {/* Expand toggle */}
                      <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-2">
                        <p className="text-[10px] text-gray-400">
                          {lead.createdAt?.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) ?? "—"}
                        </p>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : lead.id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-5 pb-5 bg-[var(--color-sand-cool)] border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                          {/* Contact */}
                          <div className="bg-white rounded-xl p-4 text-sm">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Contact</p>
                            <p className="text-[var(--color-ocean)] font-medium">{lead.fullName}</p>
                            <a href={`mailto:${lead.email}`} className="text-[var(--color-gold)] text-xs block mt-0.5">{lead.email}</a>
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-600 text-xs block mt-0.5">{lead.phone}</a>
                            <p className="text-gray-400 text-xs mt-1">Prefers: <strong>{lead.preferredContact}</strong></p>
                          </div>

                          {/* Quote breakdown */}
                          {lead.quote && (
                            <div className="bg-white rounded-xl p-4 text-sm">
                              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Quote Snapshot</p>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-gray-500">OTA rate/night</span><span>{formatCurrency(lead.quote.publicNightlyRate)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Direct rate/night</span><span>{formatCurrency(lead.quote.directNightlyRate)}</span></div>
                                <div className="flex justify-between font-bold text-[var(--color-ocean)] border-t border-gray-100 pt-1 mt-1"><span>All-inclusive total</span><span>{formatCurrency(lead.quote.directTotal)}</span></div>
                                <div className="flex justify-between text-emerald-600"><span>Savings</span><span>{formatCurrency(lead.quote.savingsValue)} ({lead.quote.savingsPercent}%)</span></div>
                              </div>
                            </div>
                          )}

                          {/* Message + UTM */}
                          <div className="bg-white rounded-xl p-4 text-sm">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Notes</p>
                            {lead.message
                              ? <p className="text-gray-600 text-xs leading-relaxed">{lead.message}</p>
                              : <p className="text-gray-400 text-xs italic">No special requests</p>
                            }
                            {lead.utmSource && (
                              <p className="text-gray-400 text-xs mt-2">Source: <strong>{lead.utmSource}</strong></p>
                            )}
                            {/* Quick reply buttons */}
                            <div className="flex gap-2 mt-3">
                              <a
                                href={`mailto:${lead.email}?subject=Your%20Veligandu%20Offer`}
                                className="flex items-center gap-1 text-xs bg-[var(--color-ocean)] text-white px-2.5 py-1.5 rounded-lg"
                              >
                                <Mail className="w-3 h-3" /> Email
                              </a>
                              <a
                                href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs bg-green-500 text-white px-2.5 py-1.5 rounded-lg"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
