import { differenceInCalendarDays } from "date-fns";
import type { Rate, RateComparison, DiscountRule } from "@/types";

export function applyDiscountRule(baseRate: number, rule?: DiscountRule): number {
  if (!rule) return baseRate;
  if (rule.type === "percentage") return baseRate * (1 - rule.value / 100);
  return Math.max(0, baseRate - rule.value);
}

export function calculateTaxAmount(baseRate: number, taxRules: Rate["taxRules"]): number {
  return taxRules.reduce((sum, rule) => sum + baseRate * (rule.percentage / 100), 0);
}

export function compareRates(
  directRate: number,
  publicRate: number
): { savingsAmount: number; savingsPercent: number } {
  const savingsAmount = Math.max(0, publicRate - directRate);
  const savingsPercent = publicRate > 0 ? Math.round((savingsAmount / publicRate) * 100) : 0;
  return { savingsAmount, savingsPercent };
}

export function buildRateComparison(
  rate: Rate,
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number
): RateComparison {
  const nights = Math.max(
    1,
    differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
  );

  const discountedRate = applyDiscountRule(rate.directBookingRate, rate.discountRule);
  const taxAmount = calculateTaxAmount(discountedRate, rate.taxRules);
  const directTotal = (discountedRate + taxAmount) * nights;
  const publicTotal =
    rate.bookingComRateBeforeTax !== undefined
      ? rate.bookingComRateBeforeTax * nights
      : undefined;

  const savings =
    publicTotal !== undefined
      ? compareRates(directTotal, publicTotal)
      : undefined;

  return {
    villaCategory: rate.villaCategory,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    directRatePerNight: discountedRate,
    directRateTotal: directTotal,
    publicRatePerNight: rate.bookingComRateBeforeTax,
    publicRateTotal: publicTotal,
    savingsAmount: savings?.savingsAmount,
    savingsPercent: savings?.savingsPercent,
    mealPlan: rate.mealPlan,
    taxAmount: taxAmount * nights,
    taxIncludedTotal: directTotal,
    availability: rate.availability,
    discountApplied: rate.discountRule,
    isBestRate: savings !== undefined && savings.savingsAmount > 0,
  };
}

/** Fallback rate used when Firestore is unavailable */
export function getFallbackRate(villaCategory: string): RateComparison {
  const baseRates: Record<string, number> = {
    overwater: 850,
    beach: 650,
    "sunset-overwater": 1100,
    honeymoon: 1400,
  };
  const base = baseRates[villaCategory] ?? 750;
  return {
    villaCategory,
    checkIn: "",
    checkOut: "",
    nights: 1,
    adults: 2,
    children: 0,
    directRatePerNight: base,
    directRateTotal: base,
    mealPlan: "BB",
    taxAmount: base * 0.16,
    taxIncludedTotal: base * 1.16,
    availability: 5,
    isBestRate: true,
  };
}
