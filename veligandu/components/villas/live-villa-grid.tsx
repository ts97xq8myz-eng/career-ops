"use client";

import { VillaCard } from "./villa-card";
import { useRates } from "@/lib/firebase/hooks/useRates";
import { useInventory } from "@/lib/firebase/hooks/useInventory";
import type { Villa } from "@/types";

interface LiveVillaGridProps {
  villas: Villa[];
}

export function LiveVillaGrid({ villas }: LiveVillaGridProps) {
  const { rates }     = useRates();
  const { inventory } = useInventory();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {villas.map((villa) => {
        const live      = rates.get(villa.category);
        const inv       = inventory.get(villa.category);

        return (
          <VillaCard
            key={villa.id}
            villa={villa}
            liveRate={live?.directRate         ?? null}
            liveAvailability={inv?.available   ?? null}
            isLive={live?.isLive               ?? false}
          />
        );
      })}
    </div>
  );
}
