import Link from "next/link";
import { ImageCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Villa } from "@/types";
import { VILLA_CATEGORY_LABELS } from "@/types";
import { Users, Maximize2, Bed } from "lucide-react";

interface VillaCardProps {
  villa: Villa;
}

export function VillaCard({ villa }: VillaCardProps) {
  const primaryImage = villa.images.find((i) => i.isPrimary) ?? villa.images[0];

  return (
    <ImageCard
      imageSrc={primaryImage?.url ?? "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80"}
      imageAlt={primaryImage?.alt ?? villa.name}
      badge={
        villa.available ? (
          <Badge variant="available" dot>Available</Badge>
        ) : (
          <Badge variant="unavailable">Fully Booked</Badge>
        )
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-1">
            {VILLA_CATEGORY_LABELS[villa.category]}
          </p>
          <h3 className="font-serif text-xl font-bold text-[var(--color-ocean)]">{villa.name}</h3>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{villa.shortDescription}</p>

        <div className="flex items-center gap-4 text-xs text-[var(--color-ocean-muted)]">
          <span className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" />
            {villa.sqm} m²
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Up to {villa.maxOccupancy}
          </span>
          <span className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            {villa.bedrooms} bed
          </span>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">From</p>
            <p className="font-serif text-xl font-bold text-[var(--color-ocean)]">
              {formatCurrency(villa.fromRateUSD)}
              <span className="text-sm font-normal text-gray-400"> /night</span>
            </p>
          </div>
          <Link href={`/villas/${villa.slug}`}>
            <Button variant="primary" size="sm">
              View Villa
            </Button>
          </Link>
        </div>
      </div>
    </ImageCard>
  );
}
