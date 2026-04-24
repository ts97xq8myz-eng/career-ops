"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { MEAL_PLAN_LABELS } from "@/types";
import { Plus, Save } from "lucide-react";

const VILLA_OPTIONS = [
  { value: "overwater", label: "Overwater Villa" },
  { value: "beach", label: "Beach Villa" },
  { value: "sunset-overwater", label: "Sunset Overwater Villa" },
  { value: "honeymoon", label: "Honeymoon Suite" },
];

const MEAL_OPTIONS = Object.entries(MEAL_PLAN_LABELS).map(([v, l]) => ({ value: v, label: l }));

interface RateRow {
  id: string;
  villaCategory: string;
  dateFrom: string;
  dateTo: string;
  directBookingRate: number;
  bookingComRateBeforeTax?: number;
  mealPlan: string;
  availability: number;
  minStay: number;
}

const INITIAL_RATES: RateRow[] = [
  { id: "r1", villaCategory: "overwater", dateFrom: "2025-06-01", dateTo: "2025-09-30", directBookingRate: 850, bookingComRateBeforeTax: 920, mealPlan: "BB", availability: 8, minStay: 3 },
  { id: "r2", villaCategory: "beach", dateFrom: "2025-06-01", dateTo: "2025-09-30", directBookingRate: 650, bookingComRateBeforeTax: 710, mealPlan: "BB", availability: 6, minStay: 3 },
  { id: "r3", villaCategory: "sunset-overwater", dateFrom: "2025-06-01", dateTo: "2025-09-30", directBookingRate: 1100, bookingComRateBeforeTax: 1200, mealPlan: "BB", availability: 4, minStay: 4 },
  { id: "r4", villaCategory: "honeymoon", dateFrom: "2025-06-01", dateTo: "2025-09-30", directBookingRate: 1400, bookingComRateBeforeTax: 1550, mealPlan: "FB", availability: 2, minStay: 5 },
];

export default function AdminRatesPage() {
  const [rates, setRates] = useState<RateRow[]>(INITIAL_RATES);
  const [saved, setSaved] = useState(false);

  const update = (id: string, field: keyof RateRow, value: string | number) => {
    setRates((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
    setSaved(false);
  };

  const handleSave = () => {
    // In production: save to Firestore
    console.log("[Admin] Saving rates:", rates);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-ocean)]">Rate Manager</h1>
          <p className="text-gray-500 mt-1">Edit rates by villa category and date range. Changes are reflected live on the website.</p>
        </div>
        <Button variant="primary" size="md" onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Villa</th>
              <th className="px-4 py-3 font-medium">Date From</th>
              <th className="px-4 py-3 font-medium">Date To</th>
              <th className="px-4 py-3 font-medium">Direct Rate (USD)</th>
              <th className="px-4 py-3 font-medium">OTA Rate (before tax)</th>
              <th className="px-4 py-3 font-medium">Meal Plan</th>
              <th className="px-4 py-3 font-medium">Availability</th>
              <th className="px-4 py-3 font-medium">Min Stay</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  <select
                    value={rate.villaCategory}
                    onChange={(e) => update(rate.id, "villaCategory", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-[var(--color-ocean)] focus:outline-none focus:border-[var(--color-gold)]"
                  >
                    {VILLA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input type="date" value={rate.dateFrom} onChange={(e) => update(rate.id, "dateFrom", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--color-gold)]" />
                </td>
                <td className="px-4 py-3">
                  <input type="date" value={rate.dateTo} onChange={(e) => update(rate.id, "dateTo", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--color-gold)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">$</span>
                    <input type="number" value={rate.directBookingRate}
                      onChange={(e) => update(rate.id, "directBookingRate", Number(e.target.value))}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--color-gold)]" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">$</span>
                    <input type="number" value={rate.bookingComRateBeforeTax ?? ""}
                      placeholder="—"
                      onChange={(e) => update(rate.id, "bookingComRateBeforeTax", Number(e.target.value))}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--color-gold)]" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select value={rate.mealPlan} onChange={(e) => update(rate.id, "mealPlan", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--color-gold)]">
                    {MEAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input type="number" value={rate.availability} min={0} max={20}
                    onChange={(e) => update(rate.id, "availability", Number(e.target.value))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--color-gold)]" />
                </td>
                <td className="px-4 py-3">
                  <input type="number" value={rate.minStay} min={1}
                    onChange={(e) => update(rate.id, "minStay", Number(e.target.value))}
                    className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--color-gold)]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-[var(--color-gold-pale)] rounded-xl text-sm text-[var(--color-ocean-muted)]">
        <strong className="text-[var(--color-ocean)]">Best Rate Logic:</strong> When OTA Rate (before tax) is set, guests see a savings comparison on villa pages and the booking form. Always set Direct Rate lower than OTA Rate to show the saving.
      </div>
    </div>
  );
}
