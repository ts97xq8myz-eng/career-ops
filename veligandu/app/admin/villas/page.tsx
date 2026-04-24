"use client";

import { useState } from "react";
import { VILLAS_SEED } from "@/lib/data/villas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VILLA_CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminVillasPage() {
  const [villas] = useState(VILLAS_SEED);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)]">Villas</h1>
          <p className="text-gray-500 mt-1">Manage villa categories, descriptions, and availability.</p>
        </div>
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
            <div className="flex gap-4 text-xs text-[var(--color-ocean-muted)] mb-4">
              <span>{villa.sqm} m²</span>
              <span>Max {villa.maxOccupancy} guests</span>
              <span>{villa.bedrooms} bedroom</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="font-bold text-[var(--color-ocean)]">
                From {formatCurrency(villa.fromRateUSD)}<span className="font-normal text-gray-400 text-xs">/night</span>
              </p>
              <div className="flex gap-2">
                <Link href={`/villas/${villa.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" className="flex items-center gap-1"
                  onClick={() => alert("Villa editor: connect to Firestore to enable live editing.")}>
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
