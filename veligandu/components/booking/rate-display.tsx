import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { RateComparison } from "@/types";
import { MEAL_PLAN_LABELS } from "@/types";
import { TrendingDown, CheckCircle } from "lucide-react";

interface RateDisplayProps {
  rate: RateComparison;
  showDetails?: boolean;
}

export function RateDisplay({ rate, showDetails = true }: RateDisplayProps) {
  return (
    <div className="bg-[var(--color-sand-cool)] rounded-xl p-5 border border-[var(--color-sand-dark)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--color-ocean-muted)] uppercase tracking-wider font-medium mb-1">
            Direct Booking Rate
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--color-ocean)]">
              {formatCurrency(rate.directRatePerNight)}
            </span>
            <span className="text-sm text-[var(--color-ocean-muted)]">/ night</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {MEAL_PLAN_LABELS[rate.mealPlan]} · Excl. tax
          </p>
        </div>

        {rate.isBestRate && rate.savingsPercent && rate.savingsPercent > 0 && (
          <Badge variant="promo" className="flex-shrink-0">
            <TrendingDown className="w-3 h-3" />
            Save {rate.savingsPercent}%
          </Badge>
        )}
      </div>

      {rate.publicRatePerNight && rate.savingsAmount && rate.savingsAmount > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-sand-dark)]">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>vs. OTA rate (before tax):</span>
            <span className="line-through text-gray-400">
              {formatCurrency(rate.publicRatePerNight)}/night
            </span>
          </div>
          <p className="text-sm text-[var(--color-gold-dark)] font-semibold mt-1 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            You save {formatCurrency(rate.savingsAmount)} by booking direct
          </p>
        </div>
      )}

      {showDetails && rate.nights > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-sand-dark)] space-y-1.5 text-sm">
          <div className="flex justify-between text-[var(--color-ocean-muted)]">
            <span>{formatCurrency(rate.directRatePerNight)} × {rate.nights} nights</span>
            <span>{formatCurrency(rate.directRatePerNight * rate.nights)}</span>
          </div>
          <div className="flex justify-between text-[var(--color-ocean-muted)]">
            <span>Tax & service</span>
            <span>{formatCurrency(rate.taxAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-[var(--color-ocean)] pt-1 border-t border-[var(--color-sand-dark)]">
            <span>Total</span>
            <span>{formatCurrency(rate.taxIncludedTotal)}</span>
          </div>
        </div>
      )}

      {rate.availability > 0 && rate.availability <= 5 && (
        <div className="mt-3">
          <Badge variant="limited" dot>
            Only {rate.availability} {rate.availability === 1 ? "villa" : "villas"} left
          </Badge>
        </div>
      )}
    </div>
  );
}
