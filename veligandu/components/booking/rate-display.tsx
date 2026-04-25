"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { RateComparison } from "@/types";
import { MEAL_PLAN_LABELS } from "@/types";
import { TrendingDown, CheckCircle, Radio, AlertTriangle, RefreshCw } from "lucide-react";
import type { LiveRate } from "@/lib/firebase/hooks/useRates";

interface RateDisplayProps {
  rate:        RateComparison;
  liveRate?:   LiveRate | null;   // from useRates hook — undefined = not loaded yet
  showDetails?: boolean;
}

export function RateDisplay({ rate, liveRate, showDetails = true }: RateDisplayProps) {
  const isLive   = liveRate?.isLive   ?? false;
  const isStale  = liveRate?.isStale  ?? false;
  const hasLive  = liveRate != null;

  const displayRate = hasLive
    ? { ...rate, directRatePerNight: liveRate!.directRate, availability: liveRate!.availability }
    : rate;

  const lastUpdated = liveRate?.updatedAt
    ? formatRelativeTime(liveRate.updatedAt)
    : null;

  return (
    <div className="bg-[var(--color-sand-cool)] rounded-xl p-5 border border-[var(--color-sand-dark)]">

      {/* Live / source indicator */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--color-ocean-muted)] uppercase tracking-wider font-medium">
          Direct Booking Rate
        </p>
        {isLive && !isStale && (
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            Live · Kafka
          </span>
        )}
        {isLive && isStale && (
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <AlertTriangle className="w-2.5 h-2.5" />
            Stale
          </span>
        )}
        {!hasLive && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider">
            <RefreshCw className="w-2.5 h-2.5" />
            Loading…
          </span>
        )}
      </div>

      {/* Rate */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[var(--color-ocean)]">
              {formatCurrency(displayRate.directRatePerNight)}
            </span>
            <span className="text-sm text-[var(--color-ocean-muted)]">/ night</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {MEAL_PLAN_LABELS[displayRate.mealPlan]} · Excl. 16% GST
          </p>
          {lastUpdated && (
            <p className="text-[10px] text-gray-400 mt-0.5">Updated {lastUpdated}</p>
          )}
        </div>

        {displayRate.isBestRate && displayRate.savingsPercent && displayRate.savingsPercent > 0 && (
          <Badge variant="promo" className="flex-shrink-0">
            <TrendingDown className="w-3 h-3" />
            Save {displayRate.savingsPercent}%
          </Badge>
        )}
      </div>

      {/* OTA comparison */}
      {displayRate.publicRatePerNight && displayRate.savingsAmount && displayRate.savingsAmount > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-sand-dark)]">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>vs. OTA rate (before tax):</span>
            <span className="line-through text-gray-400">
              {formatCurrency(displayRate.publicRatePerNight)}/night
            </span>
          </div>
          <p className="text-sm text-[var(--color-gold-dark)] font-semibold mt-1 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            You save {formatCurrency(displayRate.savingsAmount)} booking direct
          </p>
        </div>
      )}

      {/* Nightly breakdown */}
      {showDetails && displayRate.nights > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-sand-dark)] space-y-1.5 text-sm">
          <div className="flex justify-between text-[var(--color-ocean-muted)]">
            <span>{formatCurrency(displayRate.directRatePerNight)} × {displayRate.nights} nights</span>
            <span>{formatCurrency(displayRate.directRatePerNight * displayRate.nights)}</span>
          </div>
          <div className="flex justify-between text-[var(--color-ocean-muted)]">
            <span>GST (16%) &amp; service</span>
            <span>{formatCurrency(displayRate.taxAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-[var(--color-ocean)] pt-1 border-t border-[var(--color-sand-dark)]">
            <span>Total (incl. tax)</span>
            <span>{formatCurrency(displayRate.taxIncludedTotal)}</span>
          </div>
        </div>
      )}

      {/* Availability warning */}
      {displayRate.availability > 0 && displayRate.availability <= 5 && (
        <div className="mt-3">
          <Badge variant="limited" dot>
            Only {displayRate.availability} {displayRate.availability === 1 ? "villa" : "villas"} left
          </Badge>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString();
}
