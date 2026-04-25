"use client";

import { Radio, TrendingDown, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { StayQuote, AvailabilityFlag } from "@/lib/rates/calculator";

// ─── Availability Badge ───────────────────────────────────────────────────────

function AvailBadge({ flag, units }: { flag: AvailabilityFlag; units: number }) {
  if (flag === "on-request") return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <AlertTriangle className="w-3 h-3" /> On Request
    </span>
  );
  if (flag === "limited") return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
      Only {units} Left
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Available
    </span>
  );
}

// ─── Line Item ────────────────────────────────────────────────────────────────

function Line({ label, value, sub, bold, prefix = "+" }: {
  label:   string;
  value:   number;
  sub?:    string;
  bold?:   boolean;
  prefix?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between py-1.5 ${bold ? "font-semibold" : ""}`}>
      <span className="text-xs text-white/70 flex-1">{label}{sub && <span className="ml-1 opacity-60">{sub}</span>}</span>
      <span className={`text-sm tabular-nums ${bold ? "text-white font-bold" : "text-white/80"}`}>
        {prefix}{formatCurrency(value)}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StayQuoteProps {
  quote:     StayQuote;
  villaName: string;
  onEnquire: () => void;
}

export function StayQuoteDisplay({ quote: q, villaName, onEnquire }: StayQuoteProps) {
  const f = formatCurrency;

  return (
    <div className="w-full space-y-4">
      {/* Fallback notice */}
      {q.isFallback && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Live rates updating — showing best available estimate
        </div>
      )}

      {/* Side-by-side rate cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── PUBLIC RATE ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">OTA Reference</p>
              <p className="text-sm font-semibold text-gray-600 mt-0.5">Booking.com / Public Rate</p>
            </div>
            <XCircle className="w-5 h-5 text-gray-300" />
          </div>

          {/* Nightly rate */}
          <div className="mb-4">
            <p className="font-serif text-3xl font-bold text-gray-500">
              {f(q.publicNightlyRate)}
              <span className="text-base font-normal text-gray-400">/night</span>
            </p>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-1 text-sm text-gray-500 border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span>{q.nights} nights × {f(q.publicNightlyRate)}</span>
              <span className="font-semibold">{f(q.publicTotal)}</span>
            </div>
          </div>

          {/* Exclusions */}
          <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Not included</p>
            {["GST (16%)", "Service Charge (10%)", "Green Tax", "Transfers"].map((ex) => (
              <div key={ex} className="flex items-center gap-1.5 text-xs text-red-500">
                <XCircle className="w-3 h-3 flex-shrink-0" /> {ex}
              </div>
            ))}
          </div>

          <p className="mt-4 text-[10px] text-gray-400 italic">
            Public OTA reference rate. Taxes and transfers billed separately at checkout.
          </p>
        </div>

        {/* ── DIRECT RATE ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--color-ocean)] p-5 flex flex-col relative overflow-hidden">
          {/* Savings ribbon */}
          <div className="absolute top-4 right-4">
            <span className="bg-[var(--color-gold)] text-[var(--color-ocean)] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Save {q.savingsPercent}%
            </span>
          </div>

          <div className="mb-3 pr-16">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">Direct Exclusive Offer</p>
            <p className="text-sm font-semibold text-white/80 mt-0.5">All-inclusive · Private Enquiry Only</p>
          </div>

          {/* Nightly rate */}
          <div className="mb-4">
            <p className="font-serif text-3xl font-bold text-white">
              {f(q.directNightlyRate)}
              <span className="text-base font-normal text-white/60">/night</span>
            </p>
            <p className="text-xs text-[var(--color-gold)] mt-0.5 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> Taxes &amp; transfers included
            </p>
          </div>

          {/* Full breakdown */}
          <div className="flex-1 border-t border-white/20 pt-3 space-y-0.5">
            <Line label={`${q.nights} nights × ${f(q.directNightlyRate)}`} value={q.directSubtotal} prefix="" bold />
            <div className="my-2 border-t border-white/10" />
            <Line label="GST" sub="(16%)" value={q.taxes.gst} />
            <Line label="Service Charge" sub="(10%)" value={q.taxes.serviceCharge} />
            <Line label="Green Tax" sub={`($6 × ${q.totalGuests} guests × ${q.nights}n)`} value={q.taxes.greenTax} />
            <Line label={q.transferLabel} value={q.transferCost} />
          </div>

          {/* Total */}
          <div className="mt-3 pt-3 border-t border-white/30">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-[var(--color-gold)] uppercase tracking-wider">All-inclusive Total</span>
              <span className="font-serif text-2xl font-bold text-white">{f(q.directTotal)}</span>
            </div>
          </div>

          {/* Inclusions */}
          <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
            {[
              "All taxes included",
              "Return speedboat transfer",
              "Priority confirmation within 24h",
              "Personalised offer sent to you",
            ].map((inc) => (
              <div key={inc} className="flex items-center gap-1.5 text-xs text-white/80">
                <CheckCircle2 className="w-3 h-3 text-[var(--color-gold)] flex-shrink-0" /> {inc}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Savings summary bar ──────────────────────────────────────────────── */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">
                You save {formatCurrency(q.savingsValue)} ({q.savingsPercent}%)
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                vs OTA room rate — our direct total includes taxes &amp; transfers they don&apos;t
              </p>
            </div>
          </div>
          <AvailBadge flag={q.availabilityFlag} units={q.availableUnits} />
        </div>
      </div>

      {/* ── Stay summary pill row ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="bg-[var(--color-sand)] rounded-full px-3 py-1.5 font-semibold text-[var(--color-ocean)]">
          {q.nights} night{q.nights !== 1 ? "s" : ""}
        </span>
        <span className="bg-[var(--color-sand)] rounded-full px-3 py-1.5">
          {q.adults} adult{q.adults !== 1 ? "s" : ""}{q.children > 0 ? ` · ${q.children} child${q.children !== 1 ? "ren" : ""}` : ""}
        </span>
        <span className="bg-[var(--color-sand)] rounded-full px-3 py-1.5 capitalize">
          {q.villaCategory.replace("-", " ")}
        </span>
        {q.minStay > 1 && (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1.5">
            Min. {q.minStay} nights
          </span>
        )}
      </div>

      {/* ── Primary CTA ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          onClick={onEnquire}
          className="shadow-xl shadow-[var(--color-gold)]/30 text-base py-4"
        >
          Get This Rate — {formatCurrency(q.directTotal)} All-Inclusive
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
          {[
            "No payment now",
            "24h confirmation",
            "Email or WhatsApp",
          ].map((item) => (
            <div key={item} className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
