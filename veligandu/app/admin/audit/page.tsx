"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit, where, Timestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";

interface AuditLog {
  id:         string;
  action:     string;
  entityType: string;
  entityId:   string;
  userId:     string;
  metadata:   Record<string, unknown>;
  timestamp:  Date;
}

const ACTION_COLORS: Record<string, "available" | "gold" | "ocean" | "limited" | "unavailable"> = {
  lead_created:       "available",
  rate_updated:       "gold",
  conversion_logged:  "ocean",
  admin_login:        "limited",
  payment_preauth:    "ocean",
  lead_status_change: "gold",
  villa_updated:      "gold",
};

const ALL_ACTIONS = [
  "all",
  "lead_created",
  "lead_status_change",
  "rate_updated",
  "conversion_logged",
  "admin_login",
  "payment_preauth",
  "villa_updated",
];

export default function AdminAuditPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    const ref = collection(getDb(), "audit_logs");
    const q   = query(ref, orderBy("timestamp", "desc"), limit(200));

    const unsub = onSnapshot(q, (snap) => {
      const rows: AuditLog[] = snap.docs.map((d) => {
        const data = d.data();
        const ts   = data.timestamp;
        return {
          id:         d.id,
          action:     data.action     ?? "unknown",
          entityType: data.entityType ?? "—",
          entityId:   data.entityId   ?? "—",
          userId:     data.userId     ?? "system",
          metadata:   data.metadata   ?? {},
          timestamp:  ts instanceof Timestamp ? ts.toDate() : new Date(ts ?? Date.now()),
        };
      });
      setLogs(rows);
      setLastUpdate(new Date());
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, []);

  const visible = logs.filter((l) => {
    if (filter !== "all" && l.action !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.userId.toLowerCase().includes(q) || l.entityId.toLowerCase().includes(q) || l.action.includes(q);
    }
    return true;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)]">Audit Log</h1>
          <p className="text-gray-500 mt-1">All system events — leads, rate changes, admin actions, conversions.</p>
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <RefreshCw className="w-3 h-3" />
            Live · updated {lastUpdate.toLocaleTimeString("en-GB", { timeStyle: "medium" })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[var(--color-ocean)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] bg-white"
        >
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>{a === "all" ? "All actions" : a}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search actor or entity ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] w-64"
        />
        <span className="self-center text-xs text-gray-400">{visible.length} events</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading audit log…</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {logs.length === 0 ? "No audit events recorded yet." : "No events match the current filter."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Entity</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {log.timestamp.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "medium" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={ACTION_COLORS[log.action] ?? "gold"}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{log.entityType}</span>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-[120px]" title={log.entityId}>
                      {log.entityId}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 truncate max-w-[140px]" title={log.userId}>
                    {log.userId}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">
                    {JSON.stringify(log.metadata).length > 80
                      ? JSON.stringify(log.metadata).slice(0, 80) + "…"
                      : JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
