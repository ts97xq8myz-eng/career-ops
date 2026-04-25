"use client";

import { useEffect, useState, useCallback } from "react";
import { onSnapshot, doc, collection } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { getFallbackRate } from "@/lib/rates/engine";
import type { RateComparison } from "@/types";

export interface LiveRate {
  villaCategory:  string;
  directRate:     number;
  publicRate?:    number;
  currency:       string;
  mealPlan:       string;
  availability:   number;
  minStay:        number;
  dateFrom?:      string;
  dateTo?:        string;
  updatedAt:      Date;
  source:         string;
  isLive:         boolean;   // true when source=kafka
  isStale:        boolean;   // true when last update > 10 min ago
}

export type RatesMap = Map<string, LiveRate>;

const VILLA_CATEGORIES = ["overwater", "beach", "sunset-overwater", "honeymoon"] as const;
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

function toRateComparison(live: LiveRate, checkIn = "", checkOut = "", nights = 1): RateComparison {
  const tax = live.directRate * 0.16;
  const savings = live.publicRate
    ? Math.max(0, live.publicRate - live.directRate)
    : undefined;

  return {
    villaCategory:       live.villaCategory,
    checkIn,
    checkOut,
    nights,
    adults:              2,
    children:            0,
    directRatePerNight:  live.directRate,
    directRateTotal:     live.directRate * nights,
    publicRatePerNight:  live.publicRate,
    publicRateTotal:     live.publicRate ? live.publicRate * nights : undefined,
    savingsAmount:       savings,
    savingsPercent:      savings && live.publicRate
                           ? Math.round((savings / live.publicRate) * 100)
                           : undefined,
    mealPlan:            live.mealPlan as RateComparison["mealPlan"],
    taxAmount:           tax * nights,
    taxIncludedTotal:    (live.directRate + tax) * nights,
    availability:        live.availability,
    isBestRate:          !!savings && savings > 0,
  };
}

/** Subscribe to live rates for one or all villa categories */
export function useRates(villaCategory?: string) {
  const [rates, setRates]     = useState<RatesMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const categories = villaCategory
      ? [villaCategory]
      : [...VILLA_CATEGORIES];

    const unsubs: (() => void)[] = [];
    let resolved = 0;
    const total  = categories.length;

    setLoading(true);
    setError(null);

    for (const cat of categories) {
      const ref = doc(getDb(), "rates", cat);

      const unsub = onSnapshot(
        ref,
        (snap) => {
          setRates((prev) => {
            const next = new Map(prev);
            if (snap.exists()) {
              const d = snap.data();
              const updatedAt = d.updatedAt?.toDate?.() ?? new Date();
              next.set(cat, {
                villaCategory: cat,
                directRate:    d.directRate,
                publicRate:    d.publicRate  ?? undefined,
                currency:      d.currency    ?? "USD",
                mealPlan:      d.mealPlan    ?? "BB",
                availability:  d.availability ?? 5,
                minStay:       d.minStay     ?? 1,
                dateFrom:      d.dateFrom    ?? undefined,
                dateTo:        d.dateTo      ?? undefined,
                updatedAt,
                source:        d.source      ?? "firestore",
                isLive:        d.source === "kafka",
                isStale:       Date.now() - updatedAt.getTime() > STALE_THRESHOLD_MS,
              });
            }
            return next;
          });
          resolved++;
          if (resolved >= total) setLoading(false);
        },
        (err) => {
          setError(err.message);
          resolved++;
          if (resolved >= total) setLoading(false);
        }
      );
      unsubs.push(unsub);
    }

    return () => unsubs.forEach((u) => u());
  }, [villaCategory]);

  /** Get a RateComparison for a category, falling back to static data */
  const getRate = useCallback(
    (cat: string, checkIn = "", checkOut = "", nights = 1): RateComparison => {
      const live = rates.get(cat);
      if (live) return toRateComparison(live, checkIn, checkOut, nights);
      return getFallbackRate(cat);
    },
    [rates]
  );

  return { rates, loading, error, getRate };
}

/** Lightweight hook for a single villa category */
export function useVillaRate(villaCategory: string) {
  const { rates, loading, error, getRate } = useRates(villaCategory);
  const live = rates.get(villaCategory) ?? null;
  return { live, loading, error, getRate };
}
