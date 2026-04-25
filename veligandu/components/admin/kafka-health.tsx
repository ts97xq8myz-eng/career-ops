"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { useRates } from "@/lib/firebase/hooks/useRates";
import { useInventory } from "@/lib/firebase/hooks/useInventory";
import { Radio, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KafkaEvent {
  id:            string;
  topic:         string;
  action:        string;
  villaCategory: string;
  directRate?:   number;
  available?:    number;
  processedAt:   Date;
}

const VILLA_CATEGORIES = ["overwater", "beach", "sunset-overwater", "honeymoon"] as const;
const TOPIC_LABELS: Record<string, string> = {
  "veligandu.rates.live":     "Rates",
  "veligandu.inventory.live": "Inventory",
  "veligandu.bookings.confirmed": "Bookings",
};

export function KafkaHealthPanel() {
  const { rates }     = useRates();
  const { inventory } = useInventory();
  const [events, setEvents] = useState<KafkaEvent[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<{ receivedAt: string; processed: number }[]>([]);

  // Listen to last 10 Kafka events
  useEffect(() => {
    const q = query(
      collection(getDb(), "kafka_events"),
      orderBy("processedAt", "desc"),
      limit(10)
    );
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({
        id:            d.id,
        topic:         d.data().topic         ?? "",
        action:        d.data().action        ?? "",
        villaCategory: d.data().villaCategory ?? "",
        directRate:    d.data().directRate,
        available:     d.data().available,
        processedAt:   d.data().processedAt?.toDate?.() ?? new Date(),
      })));
    });
  }, []);

  // Last webhook receipt
  useEffect(() => {
    const q = query(
      collection(getDb(), "kafka_webhook_log"),
      orderBy("processedAt", "desc"),
      limit(5)
    );
    return onSnapshot(q, (snap) => {
      setWebhookLogs(snap.docs.map((d) => ({
        receivedAt: d.data().receivedAt ?? "",
        processed:  d.data().processed  ?? 0,
      })));
    });
  }, []);

  const liveCount    = [...rates.values()].filter((r) => r.isLive).length;
  const staleCount   = [...rates.values()].filter((r) => r.isLive && r.isStale).length;
  const healthStatus = liveCount === 0 ? "offline" : staleCount > 0 ? "degraded" : "live";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--color-ocean)]" />
          <h2 className="font-semibold text-[var(--color-ocean)] text-sm">Kafka Live Feed</h2>
        </div>
        <StatusBadge status={healthStatus} />
      </div>

      {/* Live rates grid */}
      <div className="p-5 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Live Rates</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VILLA_CATEGORIES.map((cat) => {
            const r = rates.get(cat);
            const inv = inventory.get(cat);
            return (
              <div key={cat} className={`rounded-lg p-3 border text-xs ${r?.isLive ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-700 capitalize">{cat.replace("-", " ")}</span>
                  {r?.isLive
                    ? <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                    : <XCircle className="w-3 h-3 text-gray-300" />}
                </div>
                <p className="font-bold text-base text-[var(--color-ocean)]">
                  {r ? formatCurrency(r.directRate) : "—"}
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5">
                  {inv ? `${inv.available} avail.` : "—"} · {r?.mealPlan ?? "BB"}
                </p>
                {r?.updatedAt && (
                  <p className="text-gray-300 text-[9px] mt-0.5">{formatRelative(r.updatedAt)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent events feed */}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Recent Events</p>
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No Kafka events received yet. Configure KAFKA_BROKERS to start streaming.</p>
        ) : (
          <div className="space-y-1.5">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-gray-600 font-medium">{TOPIC_LABELS[ev.topic] ?? ev.topic}</span>
                  <span className="text-gray-400 capitalize">{ev.villaCategory.replace("-", " ")}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  {ev.directRate && <span>{formatCurrency(ev.directRate)}/n</span>}
                  {ev.available  && <span>{ev.available} avail</span>}
                  <span>{formatRelative(ev.processedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook log */}
      {webhookLogs.length > 0 && (
        <div className="px-5 pb-4 border-t border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 my-3">HTTP Sink Webhook</p>
          <div className="space-y-1">
            {webhookLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>{log.processed} records</span>
                <span className="text-gray-300">·</span>
                <span>{log.receivedAt ? new Date(log.receivedAt).toLocaleString() : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "live" | "degraded" | "offline" }) {
  if (status === "live")     return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
      <Radio className="w-2.5 h-2.5 animate-pulse" /> Live
    </span>
  );
  if (status === "degraded") return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
      <AlertTriangle className="w-2.5 h-2.5" /> Stale
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
      <XCircle className="w-2.5 h-2.5" /> Offline
    </span>
  );
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
