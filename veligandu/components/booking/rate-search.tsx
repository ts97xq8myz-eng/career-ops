"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CalendarDays, Users, Home, Loader2, RefreshCw } from "lucide-react";
import { useRates } from "@/lib/firebase/hooks/useRates";
import { useInventory } from "@/lib/firebase/hooks/useInventory";
import {
  buildStayQuote,
  buildFallbackQuote,
  countNights,
  BASELINE_PUBLIC_RATES,
  BASELINE_MIN_STAY,
  type StayQuote,
} from "@/lib/rates/calculator";
import { cn } from "@/lib/utils";

const VILLA_OPTIONS = [
  { value: "overwater",        label: "Overwater Villa",        from: BASELINE_PUBLIC_RATES["overwater"] },
  { value: "beach",            label: "Beachfront Villa",       from: BASELINE_PUBLIC_RATES["beach"] },
  { value: "sunset-overwater", label: "Sunset Overwater Villa", from: BASELINE_PUBLIC_RATES["sunset-overwater"] },
  { value: "honeymoon",        label: "Honeymoon Suite",        from: BASELINE_PUBLIC_RATES["honeymoon"] },
];

function todayStr() { return new Date().toISOString().split("T")[0]; }
function plusDaysStr(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

interface RateSearchProps {
  initialVilla?:   string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?:  number;
  initialChildren?: number;
  onQuote:         (quote: StayQuote) => void;
  compact?:        boolean;
}

export function RateSearch({
  initialVilla   = "overwater",
  initialCheckIn,
  initialCheckOut,
  initialAdults  = 2,
  initialChildren = 0,
  onQuote,
  compact = false,
}: RateSearchProps) {
  const [villaCategory, setVillaCategory] = useState(initialVilla);
  const [checkIn,  setCheckIn]   = useState(initialCheckIn  ?? todayStr());
  const [checkOut, setCheckOut]  = useState(initialCheckOut ?? plusDaysStr(7));
  const [adults,   setAdults]    = useState(initialAdults);
  const [children, setChildren]  = useState(initialChildren);
  const [calculating, setCalculating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { rates, loading: ratesLoading } = useRates(villaCategory);
  const { inventory }                    = useInventory(villaCategory);

  // Recalculate quote whenever any input changes — debounced 200ms
  const recalculate = useCallback(() => {
    setCalculating(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const liveRate  = rates.get(villaCategory);
      const liveInv   = inventory.get(villaCategory);

      if (liveRate?.publicRate && !ratesLoading) {
        // Live data from Kafka/Firestore
        onQuote(buildStayQuote({
          villaCategory,
          checkIn,
          checkOut,
          adults,
          children,
          publicNightlyRate: liveRate.publicRate,
          availableUnits:    liveInv?.available ?? liveRate.availability,
          minStay:           liveRate.minStay,
          isFallback:        false,
        }));
      } else if (liveRate && !ratesLoading) {
        // Kafka rate exists but no publicRate set — use directRate * 1.1 as OTA reference
        const impliedPublic = liveRate.directRate / (1 - 9 / 100);
        onQuote(buildStayQuote({
          villaCategory,
          checkIn,
          checkOut,
          adults,
          children,
          publicNightlyRate: impliedPublic,
          availableUnits:    liveInv?.available ?? liveRate.availability,
          minStay:           liveRate.minStay,
          isFallback:        false,
        }));
      } else {
        // Fallback to baseline
        onQuote(buildFallbackQuote({ villaCategory, checkIn, checkOut, adults, children }));
      }

      setCalculating(false);
    }, 200);
  }, [villaCategory, checkIn, checkOut, adults, children, rates, inventory, ratesLoading, onQuote]);

  useEffect(() => {
    recalculate();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [recalculate]);

  const nights = countNights(checkIn, checkOut);

  const inputCls = cn(
    "w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow",
    compact
      ? "border-white/20 bg-white/10 text-white placeholder-white/60 px-3 py-2.5 focus:ring-white/40"
      : "border-gray-200 bg-white text-[var(--color-ocean)] px-3 py-2.5"
  );

  const labelCls = cn(
    "block text-xs font-semibold uppercase tracking-widest mb-1.5",
    compact ? "text-white/70" : "text-gray-500"
  );

  return (
    <div className={cn("w-full", compact ? "" : "bg-white rounded-2xl shadow-lg border border-gray-100 p-6")}>
      {!compact && (
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="w-5 h-5 text-[var(--color-gold)]" />
          <h3 className="font-serif text-lg font-bold text-[var(--color-ocean)]">Search Availability & Rates</h3>
          {calculating && <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-auto" />}
        </div>
      )}

      <div className={cn(
        "grid gap-3",
        compact
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          : "grid-cols-1 sm:grid-cols-2"
      )}>
        {/* Villa Category */}
        <div className={compact ? "col-span-2 md:col-span-3 lg:col-span-2" : ""}>
          <label className={labelCls}>
            <Home className="w-3 h-3 inline mr-1" />Villa Type
          </label>
          <select
            value={villaCategory}
            onChange={(e) => setVillaCategory(e.target.value)}
            className={inputCls}
          >
            {VILLA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div>
          <label className={labelCls}>
            <CalendarDays className="w-3 h-3 inline mr-1" />Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={todayStr()}
            onChange={(e) => {
              setCheckIn(e.target.value);
              // Auto-advance checkout if it's before new checkin
              if (e.target.value >= checkOut) {
                const d = new Date(e.target.value);
                d.setDate(d.getDate() + (BASELINE_MIN_STAY[villaCategory] ?? 3));
                setCheckOut(d.toISOString().split("T")[0]);
              }
            }}
            className={inputCls}
          />
        </div>

        {/* Check-out */}
        <div>
          <label className={labelCls}>
            <CalendarDays className="w-3 h-3 inline mr-1" />Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Adults */}
        <div>
          <label className={labelCls}>
            <Users className="w-3 h-3 inline mr-1" />Adults
          </label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className={inputCls}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} Adult{n !== 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        {/* Children */}
        <div>
          <label className={labelCls}>Children</label>
          <select
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className={inputCls}
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} Child{n !== 1 ? "ren" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Nights summary pill */}
      {!compact && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-[var(--color-sand)] rounded-full px-3 py-1 font-semibold text-[var(--color-ocean)]">
            {nights} night{nights !== 1 ? "s" : ""}
          </span>
          <span>·</span>
          <span>{adults} adult{adults !== 1 ? "s" : ""}{children > 0 ? ` · ${children} child${children !== 1 ? "ren" : ""}` : ""}</span>
          {calculating && (
            <span className="ml-auto flex items-center gap-1 text-[var(--color-gold)]">
              <RefreshCw className="w-3 h-3 animate-spin" /> Updating rates…
            </span>
          )}
        </div>
      )}
    </div>
  );
}

