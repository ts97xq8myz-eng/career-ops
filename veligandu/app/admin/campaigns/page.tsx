"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, MousePointer, DollarSign } from "lucide-react";

const CAMPAIGNS = [
  { id: "c1", name: "Maldives Honeymoon 2025", source: "google", medium: "cpc", clicks: 1240, leads: 18, spend: 1850, status: "active" },
  { id: "c2", name: "Early Bird Summer", source: "facebook", medium: "social", clicks: 880, leads: 12, spend: 620, status: "active" },
  { id: "c3", name: "Dive Package SEA", source: "google", medium: "cpc", clicks: 540, leads: 7, spend: 410, status: "paused" },
];

const UTM_RECENT = [
  { source: "google", medium: "cpc", campaign: "maldives-honeymoon-2025", leads: 18, cpl: "$102" },
  { source: "facebook", medium: "social", campaign: "early-bird-summer", leads: 12, cpl: "$51" },
  { source: "instagram", medium: "social", campaign: "brand-awareness", leads: 5, cpl: "$88" },
  { source: "organic", medium: "(none)", campaign: "(none)", leads: 12, cpl: "$0" },
];

export default function AdminCampaignsPage() {
  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)] mb-2">Campaigns & Conversion</h1>
      <p className="text-gray-500 mb-8">Ad performance, UTM tracking, and Booking.com rate settings.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Clicks (30d)", value: "2,660", icon: MousePointer },
          { label: "Total Leads (30d)", value: "37", icon: TrendingUp },
          { label: "Avg Cost Per Lead", value: "$78", icon: DollarSign },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-ocean)]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--color-ocean)]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="font-bold text-xl text-[var(--color-ocean)]">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[var(--color-ocean)]">Active Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Campaign</th>
                <th className="px-5 py-3 font-medium">Source / Medium</th>
                <th className="px-5 py-3 font-medium">Clicks</th>
                <th className="px-5 py-3 font-medium">Leads</th>
                <th className="px-5 py-3 font-medium">Spend</th>
                <th className="px-5 py-3 font-medium">CPL</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-[var(--color-ocean)]">{c.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{c.source} / {c.medium}</td>
                  <td className="px-5 py-3.5">{c.clicks.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-semibold">{c.leads}</td>
                  <td className="px-5 py-3.5">${c.spend.toLocaleString()}</td>
                  <td className="px-5 py-3.5">${Math.round(c.spend / c.leads)}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={c.status === "active" ? "available" : "limited"}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UTM breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[var(--color-ocean)]">UTM Source Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Medium</th>
                <th className="px-5 py-3 font-medium">Campaign</th>
                <th className="px-5 py-3 font-medium">Leads</th>
                <th className="px-5 py-3 font-medium">CPL</th>
              </tr>
            </thead>
            <tbody>
              {UTM_RECENT.map((u) => (
                <tr key={`${u.source}-${u.campaign}`} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-[var(--color-ocean)]">{u.source}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.medium}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{u.campaign}</td>
                  <td className="px-5 py-3.5 font-semibold">{u.leads}</td>
                  <td className="px-5 py-3.5">{u.cpl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking.com rate input */}
      <div className="bg-[var(--color-gold-pale)] rounded-xl p-6 border border-[var(--color-gold)]">
        <h3 className="font-semibold text-[var(--color-ocean)] mb-2">Booking.com Reference Rate</h3>
        <p className="text-sm text-[var(--color-ocean-muted)] mb-4">
          Manually set the latest Booking.com rate before tax. This appears on villa pages as the public reference rate to show guests how much they save by booking direct.
        </p>
        <div className="flex gap-3 flex-wrap">
          <input
            type="number"
            placeholder="e.g. 920"
            className="border border-[var(--color-gold)] rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
          />
          <Button variant="primary" size="md"
            onClick={() => alert("Rate saved. Connect Firestore to persist.")}>
            Update Reference Rate
          </Button>
        </div>
      </div>
    </div>
  );
}
