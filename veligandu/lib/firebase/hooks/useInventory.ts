"use client";

import { useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

export interface LiveInventory {
  villaCategory: string;
  available:     number;
  nextDate?:     string;
  updatedAt:     Date;
  source:        string;
  isLive:        boolean;
  isStale:       boolean;
}

export type InventoryMap = Map<string, LiveInventory>;

const VILLA_CATEGORIES = ["overwater", "beach", "sunset-overwater", "honeymoon"] as const;
const STALE_THRESHOLD_MS = 10 * 60 * 1000;

/** Availability badge display logic */
export function availabilityBadge(available: number): {
  label:   string;
  variant: "available" | "limited" | "unavailable";
  dot:     boolean;
} {
  if (available <= 0) return { label: "Fully Booked",         variant: "unavailable", dot: false };
  if (available <= 2) return { label: `Only ${available} left`, variant: "limited",    dot: true  };
  if (available <= 5) return { label: `${available} available`, variant: "limited",    dot: true  };
  return               { label: "Available",                  variant: "available",  dot: true  };
}

/** Subscribe to live inventory summaries for all or one category */
export function useInventory(villaCategory?: string) {
  const [inventory, setInventory] = useState<InventoryMap>(new Map());
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const categories = villaCategory
      ? [villaCategory]
      : [...VILLA_CATEGORIES];

    const unsubs: (() => void)[] = [];
    let resolved = 0;

    setLoading(true);

    for (const cat of categories) {
      const ref = doc(getDb(), "inventory_summary", cat);

      const unsub = onSnapshot(
        ref,
        (snap) => {
          setInventory((prev) => {
            const next = new Map(prev);
            if (snap.exists()) {
              const d = snap.data();
              const updatedAt = d.updatedAt?.toDate?.() ?? new Date();
              next.set(cat, {
                villaCategory: cat,
                available:     d.available  ?? 5,
                nextDate:      d.nextDate   ?? undefined,
                updatedAt,
                source:        d.source     ?? "firestore",
                isLive:        d.source === "kafka",
                isStale:       Date.now() - updatedAt.getTime() > STALE_THRESHOLD_MS,
              });
            }
            return next;
          });
          resolved++;
          if (resolved >= categories.length) setLoading(false);
        },
        (err) => {
          setError(err.message);
          resolved++;
          if (resolved >= categories.length) setLoading(false);
        }
      );
      unsubs.push(unsub);
    }

    return () => unsubs.forEach((u) => u());
  }, [villaCategory]);

  return { inventory, loading, error };
}
