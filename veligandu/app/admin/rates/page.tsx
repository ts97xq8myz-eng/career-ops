"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Save, RefreshCw, Radio, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DIRECT_DISCOUNT_PERCENT, buildStayQuote } from "@/lib/rates/calculator";

const VILLA_OPTIONS = [
  { value: "overwater",        label: "Overwater Villa" },
  { value: "beach",            label: "Beachfront Villa" },
  { value: "sunset-overwater", label: "Sunset Overwater Villa" },
  { value: "honeymoon",        label: "Honeymoon Suite" },
];

const MEAL_OPTIONS = ["BB", "HB", "FB", "AI"].map((v) => ({ value: v, label: v }));

interface RateDoc {
  villaCategory:       string;
  publicRate:          number;   // OTA reference (Booking.com)
  directRate?:         number;   // auto-computed from publicRate
  discountPercent:     number;   // default 9
  mealPlan:            string;
  availability:        number;
  minStay:             number;
  taxesIncluded:       boolean;  // always true for direct
  transferIncluded:    boolean;  // always true for direct
  source:              string;
  updatedAt?:          Date;
  isLive:              boolean;
  isStale:             boolean;
}

type RatesMap = Record<string, RateDoc>;

const DEFAULT_RATES: RatesMap = {
  "overwater":        { villaCategory: "overwater",        publicRate: 920,  discountPercent: 9, mealPlan: "BB", availability: 8, minStay: 3, taxesIncluded: true, transferIncluded: true, source: "admin", isLive: false, isStale: false },
  "beach":            { villaCategory: "beach",            publicRate: 710,  discountPercent: 9, mealPlan: "BB", availability: 6, minStay: 3, taxesIncluded: true, transferIncluded: true, source: "admin", isLive: false, isStale: false },
  "sunset-overwater": { villaCategory: "sunset-overwater", publicRate: 1200, discountPercent: 9, mealPlan: "BB", availability: 4, minStay: 4, taxesIncluded: true, transferIncluded: true, source: "admin", isLive: false, isStale: false },
  "honeymoon":        { villaCategory: "honeymoon",        publicRate: 1550, discountPercent: 9, mealPlan: "FB", availability: 2, minStay: 5, taxesIncluded: true, transferIncluded: true, source: "admin", isLive: false, isStale: false },
};

// Sample quote for preview
function getPreviewQuote(r: RateDoc) {
  return buildStayQuote({
    villaCategory:     r.villaCategory,
    checkIn:           "2025-12-01",
    checkOut:          "2025-12-08",
    adults:            2, children: 0,
    publicNightlyRate: r.publicRate,
    availableUnits:    r.availability,
    minStay:           r.minStay,
  });
}

export default function AdminRatesPage() {
  const [rates, setRates]     = useState<RatesMap>(DEFAULT_RATES);
  const [dirty, setDirty]     = useState<Set<string>>(new Set());
  const [saving, setSaving]   = useState<Set<string>>(new Set());
  const [saved, setSaved]     = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Subscribe to live rates from Firestore
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    for (const cat of Object.keys(DEFAULT_RATES)) {
      const ref = doc(getDb(), "rates", cat);
      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          const updatedAt = d.updatedAt?.toDate?.() ?? new Date();
          setRates((prev) => ({
            ...prev,
            [cat]: {
              villaCategory:    cat,
              publicRate:       d.publicRate      ?? prev[cat]?.publicRate ?? DEFAULT_RATES[cat].publicRate,
              directRate:       d.directRate,
              discountPercent:  d.discountPercent ?? DIRECT_DISCOUNT_PERCENT,
              mealPlan:         d.mealPlan        ?? "BB",
              availability:     d.availability    ?? 5,
              minStay:          d.minStay         ?? 3,
              taxesIncluded:    true,
              transferIncluded: true,
              source:           d.source          ?? "admin",
              updatedAt,
              isLive:           d.source === "kafka",
              isStale:          Date.now() - updatedAt.getTime() > 10 * 60 * 1000,
            },
          }));
        }
        setLoading(false);
      }, () => setLoading(false));
      unsubs.push(unsub);
    }

    return () => unsubs.forEach((u) => u());
  }, []);

  const update = (cat: string, field: keyof RateDoc, value: number | string | boolean) => {
    setRates((prev) => ({ ...prev, [cat]: { ...prev[cat], [field]: value } }));
    setDirty((prev) => new Set([...prev, cat]));
    setSaved((prev) => { const n = new Set(prev); n.delete(cat); return n; });
  };

  const saveCategory = async (cat: string) => {
    const r = rates[cat];
    if (!r) return;

    setSaving((prev) => new Set([...prev, cat]));
    try {
      const directRate = r.publicRate * (1 - r.discountPercent / 100);
      await setDoc(doc(getDb(), "rates", cat), {
        villaCategory:    cat,
        publicRate:       r.publicRate,
        directRate,
        discountPercent:  r.discountPercent,
        mealPlan:         r.mealPlan,
        availability:     r.availability,
        minStay:          r.minStay,
        taxesIncluded:    true,
        transferIncluded: true,
        source:           "admin",
        updatedAt:        new Date(),
      }, { merge: true });

      setDirty((prev) => { const n = new Set(prev); n.delete(cat); return n; });
      setSaved((prev) => new Set([...prev, cat]));
      setTimeout(() => setSaved((prev) => { const n = new Set(prev); n.delete(cat); return n; }), 3000);
    } catch (err) {
      console.error("Rate save failed:", err);
    } finally {
      setSaving((prev) => { const n = new Set(prev); n.delete(cat); return n; });
    }
  };

  const saveAll = async () => {
    await Promise.all([...dirty].map((cat) => saveCategory(cat)));
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[var(--color-ocean)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)]">Rate Manager</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Set OTA reference rates. Direct rate is always{" "}
            <strong>{DIRECT_DISCOUNT_PERCENT}% below public</strong> — auto-computed, inclusive of taxes &amp; transfers.
          </p>
        </div>
        {dirty.size > 0 && (
          <Button variant="primary" size="md" onClick={saveAll} className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save All ({dirty.size})
          </Button>
        )}
      </div>

      {/* Live status bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Object.values(rates).map((r) => (
          <div key={r.villaCategory} className={`rounded-xl border p-3 ${r.isLive ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-600 capitalize">{r.villaCategory.replace("-", " ")}</span>
              {r.isLive
                ? <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                : <span className="w-2 h-2 rounded-full bg-gray-300" />
              }
            </div>
            <p className="font-bold text-[var(--color-ocean)]">{formatCurrency(r.publicRate)}</p>
            <p className="text-xs text-gray-400">{r.isLive ? "Kafka live" : r.source}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading live rates from Firestore…
        </div>
      )}

      {/* Rate cards */}
      <div className="space-y-6">
        {VILLA_OPTIONS.map(({ value: cat, label }) => {
          const r = rates[cat] ?? DEFAULT_RATES[cat];
          if (!r) return null;

          const directRate = r.publicRate * (1 - r.discountPercent / 100);
          const preview    = getPreviewQuote(r);
          const isSaving   = saving.has(cat);
          const isSaved    = saved.has(cat);
          const isDirty    = dirty.has(cat);

          return (
            <div key={cat} className={`bg-white rounded-2xl border-2 transition-colors ${isDirty ? "border-[var(--color-gold)]" : "border-gray-100"} shadow-sm overflow-hidden`}>
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-ocean)]">{label}</p>
                    {r.isLive && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Radio className="w-2.5 h-2.5 animate-pulse" /> Kafka live — override below
                      </p>
                    )}
                    {r.isStale && r.isLive && (
                      <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Stale — last update &gt;10 min ago
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSaved && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => saveCategory(cat)}
                    disabled={isSaving || !isDirty}
                    className="flex items-center gap-1.5"
                  >
                    {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    {isSaving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      OTA / Booking.com Rate (before tax, USD/night)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={r.publicRate}
                        min={1}
                        onChange={(e) => update(cat, "publicRate", Number(e.target.value))}
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">This is shown as the OTA reference — never as our rate.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      Discount % (default {DIRECT_DISCOUNT_PERCENT}%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={r.discountPercent}
                        min={1}
                        max={50}
                        onChange={(e) => update(cat, "discountPercent", Number(e.target.value))}
                        className={`${inputCls} pr-7`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                        Availability
                      </label>
                      <input
                        type="number"
                        value={r.availability}
                        min={0}
                        max={50}
                        onChange={(e) => update(cat, "availability", Number(e.target.value))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                        Min Stay (nights)
                      </label>
                      <input
                        type="number"
                        value={r.minStay}
                        min={1}
                        onChange={(e) => update(cat, "minStay", Number(e.target.value))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      Meal Plan
                    </label>
                    <select
                      value={r.mealPlan}
                      onChange={(e) => update(cat, "mealPlan", e.target.value)}
                      className={inputCls}
                    >
                      {MEAL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-computed direct rate */}
                  <div className="bg-[var(--color-sand)] rounded-xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Auto-computed Direct Rate
                    </p>
                    <p className="font-serif text-2xl font-bold text-[var(--color-ocean)]">
                      {formatCurrency(directRate)}<span className="text-sm font-normal text-gray-500">/night</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      = {formatCurrency(r.publicRate)} × (1 − {r.discountPercent}%)
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Taxes &amp; transfers included in guest price
                    </div>
                  </div>
                </div>

                {/* 7-night preview quote */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                    7-Night Stay Preview (2 adults)
                  </p>
                  <div className="rounded-xl border border-gray-200 overflow-hidden text-sm">
                    <div className="grid grid-cols-2">
                      <div className="bg-gray-50 p-4 border-r border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">OTA Reference</p>
                        <p className="font-bold text-gray-500 text-lg">{formatCurrency(preview.publicTotal)}</p>
                        <p className="text-xs text-gray-400 mt-1">excl. taxes &amp; transfers</p>
                      </div>
                      <div className="bg-[var(--color-ocean)] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-2">Direct All-in</p>
                        <p className="font-bold text-white text-lg">{formatCurrency(preview.directTotal)}</p>
                        <p className="text-xs text-white/60 mt-1">incl. taxes &amp; transfers</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5 bg-gray-50">
                      {[
                        ["Room (7n)", formatCurrency(preview.directSubtotal)],
                        ["GST 16%", formatCurrency(preview.taxes.gst)],
                        ["Service 10%", formatCurrency(preview.taxes.serviceCharge)],
                        ["Green Tax", formatCurrency(preview.taxes.greenTax)],
                        ["Speedboat RT", formatCurrency(preview.transferCost)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs text-gray-500">
                          <span>{k}</span><span className="font-medium">{v}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-bold text-[var(--color-ocean)]">
                        <span>Saves</span>
                        <span className="text-emerald-600">{formatCurrency(preview.savingsValue)} ({preview.savingsPercent}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-[var(--color-sand)] rounded-xl text-sm text-[var(--color-ocean-muted)]">
        <strong className="text-[var(--color-ocean)]">Rate Rule:</strong> Public rate = OTA reference shown to guests for comparison (excl. taxes). Direct rate = auto-computed at <strong>{DIRECT_DISCOUNT_PERCENT}%</strong> below public, displayed all-inclusive (GST 16% + service 10% + Green Tax $6/pax/night + speedboat transfer). Kafka live rates override these when connected — use this panel to set fallback/baseline values or to override Kafka.
      </div>
    </div>
  );
}
