"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { VILLAS_SEED } from "@/lib/data/villas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VILLA_CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Eye, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Villa } from "@/types";

export default function AdminVillasPage() {
  const [villas,  setVillas]  = useState<Villa[]>(VILLAS_SEED);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null); // id of villa being toggled

  useEffect(() => {
    const unsub = onSnapshot(collection(getDb(), "villas"), (snap) => {
      if (!snap.empty) {
        const live = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Villa));
        setVillas(live.length ? live : VILLAS_SEED);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  async function toggleAvailability(villa: Villa) {
    setSaving(villa.id);
    try {
      await updateDoc(doc(getDb(), "villas", villa.id), {
        available:  !villa.available,
        updatedAt:  new Date().toISOString(),
      });
    } catch {
      // Optimistically update local state so UI reflects toggle even if Firestore is offline
      setVillas((prev) => prev.map((v) => v.id === villa.id ? { ...v, available: !v.available } : v));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)]">Villas</h1>
          <p className="text-gray-500 mt-1">Manage villa availability. Edit rates in the{" "}
            <Link href="/admin/rates" className="text-[var(--color-gold)] underline underline-offset-2">Rates panel</Link>.
          </p>
        </div>
        {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {villas.map((villa) => (
          <div key={villa.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="ocean">{VILLA_CATEGORY_LABELS[villa.category]}</Badge>
                <h3 className="font-serif text-xl font-bold text-[var(--color-ocean)] mt-2">{villa.name}</h3>
              </div>
              <Badge variant={villa.available ? "available" : "unavailable"} dot>
                {villa.available ? "Available" : "Booked Out"}
              </Badge>
            </div>

            <p className="text-gray-600 text-sm mb-4">{villa.shortDescription}</p>

            <div className="flex gap-4 text-xs text-gray-400 mb-4">
              <span>{villa.sqm} m²</span>
              <span>Max {villa.maxOccupancy} guests</span>
              <span>{villa.bedrooms} bedroom</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="font-bold text-[var(--color-ocean)]">
                From {formatCurrency(villa.fromRateUSD)}
                <span className="font-normal text-gray-400 text-xs">/night</span>
              </p>
              <div className="flex gap-2">
                <Link href={`/villas/${villa.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </Button>
                </Link>
                <Button
                  variant={villa.available ? "secondary" : "primary"}
                  size="sm"
                  className="flex items-center gap-1.5"
                  disabled={saving === villa.id}
                  onClick={() => toggleAvailability(villa)}
                >
                  {saving === villa.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : villa.available
                      ? <ToggleRight className="w-3.5 h-3.5" />
                      : <ToggleLeft  className="w-3.5 h-3.5" />
                  }
                  {villa.available ? "Mark Unavailable" : "Mark Available"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
