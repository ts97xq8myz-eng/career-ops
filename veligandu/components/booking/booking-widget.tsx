"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, Home, ChevronDown } from "lucide-react";

const VILLA_OPTIONS = [
  { value: "", label: "Any Villa Type" },
  { value: "overwater", label: "Overwater Villa" },
  { value: "beach", label: "Beach Villa" },
  { value: "sunset-overwater", label: "Sunset Overwater Villa" },
  { value: "honeymoon", label: "Honeymoon Suite" },
];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

interface BookingWidgetProps {
  compact?: boolean;
}

export function BookingWidget({ compact = false }: BookingWidgetProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(getTodayStr());
  const [checkOut, setCheckOut] = useState(getTomorrowStr());
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [villaCategory, setVillaCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
      ...(villaCategory && { villaCategory }),
    });
    router.push(`/book?${params.toString()}`);
  };

  const inputBase =
    "w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2.5 text-white placeholder:text-white/60 text-sm focus:outline-none focus:border-[var(--color-gold)] focus:bg-white/20 transition-all";

  return (
    <form onSubmit={handleSearch} className={compact ? "" : "glass rounded-2xl p-6 shadow-[var(--shadow-hero)]"}>
      {!compact && (
        <p className="text-white font-semibold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[var(--color-gold)]" />
          Find Your Villa
        </p>
      )}
      <div className={`grid gap-3 ${compact ? "grid-cols-2 md:grid-cols-5" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"}`}>
        <div className="flex flex-col gap-1">
          <label className="text-white/70 text-xs uppercase tracking-wider">Check-in</label>
          <input
            type="date"
            value={checkIn}
            min={getTodayStr()}
            onChange={(e) => setCheckIn(e.target.value)}
            className={inputBase}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/70 text-xs uppercase tracking-wider">Check-out</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className={inputBase}
            required
          />
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-white/70 text-xs uppercase tracking-wider">Adults</label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className={inputBase + " cursor-pointer"}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n} className="text-[var(--color-ocean)]">
                  {n} Adult{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-white/70 text-xs uppercase tracking-wider">Children</label>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className={inputBase + " cursor-pointer"}
            >
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n} className="text-[var(--color-ocean)]">
                  {n} Child{n !== 1 ? "ren" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!compact && (
          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-xs uppercase tracking-wider">Villa Type</label>
            <select
              value={villaCategory}
              onChange={(e) => setVillaCategory(e.target.value)}
              className={inputBase + " cursor-pointer"}
            >
              {VILLA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-[var(--color-ocean)]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-end">
          <Button type="submit" variant="primary" size="lg" fullWidth>
            Check Availability
          </Button>
        </div>
      </div>
    </form>
  );
}
