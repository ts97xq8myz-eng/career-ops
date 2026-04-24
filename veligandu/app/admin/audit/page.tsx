"use client";

import { Badge } from "@/components/ui/badge";

const AUDIT_LOGS = [
  { id: "a1", action: "lead_created", entityType: "lead", entityId: "lead_001", userId: "system", metadata: { villaCategory: "overwater", email: "james@example.com" }, timestamp: "2025-04-01T10:23:00Z" },
  { id: "a2", action: "rate_updated", entityType: "rate", entityId: "r1", userId: "admin@veligandu.com", metadata: { field: "directBookingRate", from: 820, to: 850 }, timestamp: "2025-04-01T09:15:00Z" },
  { id: "a3", action: "conversion_logged", entityType: "lead", entityId: "lead_001", userId: "system", metadata: { value: 850, currency: "USD" }, timestamp: "2025-04-01T10:23:05Z" },
  { id: "a4", action: "lead_created", entityType: "lead", entityId: "lead_002", userId: "system", metadata: { villaCategory: "honeymoon", email: "sophie@example.com" }, timestamp: "2025-04-02T14:07:00Z" },
  { id: "a5", action: "admin_login", entityType: "admin", entityId: "admin@veligandu.com", userId: "admin@veligandu.com", metadata: { ip: "192.168.1.1" }, timestamp: "2025-04-01T08:55:00Z" },
  { id: "a6", action: "rate_updated", entityType: "rate", entityId: "r3", userId: "admin@veligandu.com", metadata: { field: "availability", from: 6, to: 4 }, timestamp: "2025-04-03T11:30:00Z" },
];

const ACTION_COLORS: Record<string, "available" | "gold" | "ocean" | "limited" | "unavailable"> = {
  lead_created: "available",
  rate_updated: "gold",
  conversion_logged: "ocean",
  admin_login: "limited",
  payment_preauth: "ocean",
};

export default function AdminAuditPage() {
  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)] mb-2">Audit Log</h1>
      <p className="text-gray-500 mb-8">All system events — leads, rate changes, admin actions, and conversions.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
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
            {AUDIT_LOGS.map((log) => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "medium" })}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={ACTION_COLORS[log.action] ?? "gold"}>
                    {log.action}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{log.entityType}</span>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-[100px]">{log.entityId}</p>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{log.userId}</td>
                <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">
                  {JSON.stringify(log.metadata).slice(0, 60)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
