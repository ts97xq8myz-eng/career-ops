export type MealPlan = "RO" | "BB" | "HB" | "FB" | "AI";

export const MEAL_PLAN_LABELS: Record<MealPlan, string> = {
  RO: "Room Only",
  BB: "Bed & Breakfast",
  HB: "Half Board",
  FB: "Full Board",
  AI: "All Inclusive",
};

export interface TaxRule {
  name: string;
  percentage: number;
  appliesTo: "base" | "total";
}

export interface DiscountRule {
  type: "percentage" | "fixed";
  value: number;
  minNights?: number;
  label: string;
}

export interface Rate {
  id: string;
  villaCategory: string;
  dateFrom: string;
  dateTo: string;
  baseRateUSD: number;
  mealPlan: MealPlan;
  taxRules: TaxRule[];
  availability: number;
  minStay: number;
  maxOccupancy: number;
  publicRateSource?: string;
  bookingComRateBeforeTax?: number;
  directBookingRate: number;
  discountRule?: DiscountRule;
  lastSyncedAt: string;
}

export interface RateComparison {
  villaCategory: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  directRatePerNight: number;
  directRateTotal: number;
  publicRatePerNight?: number;
  publicRateTotal?: number;
  savingsAmount?: number;
  savingsPercent?: number;
  mealPlan: MealPlan;
  taxAmount: number;
  taxIncludedTotal: number;
  availability: number;
  discountApplied?: DiscountRule;
  isBestRate: boolean;
}
