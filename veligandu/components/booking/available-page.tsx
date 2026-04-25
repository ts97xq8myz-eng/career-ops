"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Lock, Plane, TrendingDown, Radio } from "lucide-react";
import { useRates } from "@/lib/firebase/hooks/useRates";
import { useInventory, availabilityBadge } from "@/lib/firebase/hooks/useInventory";
import {
  buildStayQuote,
  buildFallbackQuote,
  countNights,
  BASELINE_PUBLIC_RATES,
  BASELINE_AVAILABILITY,
  BASELINE_MIN_STAY,
  TRANSFERS,
  DIRECT_DISCOUNT_PERCENT,
  type StayQuote,
} from "@/lib/rates/calculator";
import { formatCurrency } from "@/lib/utils";
import { RateGate } from "@/components/booking/rate-gate";
import { Button } from "@/components/ui/button";
import { EnquiryModal } from "@/components/booking/enquiry-modal";
import { PlacesImage } from "@/components/ui/places-image";

// ─── Villa catalogue ──────────────────────────────────────────────────────────

const VILLA_CATALOGUE = [
  {
    category:    "beach",
    name:        "Beachfront Villa",
    tagline:     "Soft sand, swaying palms, direct beach access.",
    maxOccupancy: 4,
    sqm:         110,
    placesIndex: 1,
    fallbackImg: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    highlights:  ["Private beach terrace", "Open-air bathroom", "Daybed under palms"],
  },
  {
    category:    "overwater",
    name:        "Classic Overwater Villa",
    tagline:     "Glass floor panels, private deck, lagoon ladder.",
    maxOccupancy: 3,
    sqm:         92,
    placesIndex: 2,
    fallbackImg: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
    highlights:  ["Glass floor panels", "Private infinity deck", "Direct lagoon ladder"],
  },
  {
    category:    "sunset-overwater",
    name:        "Sunset Overwater Villa",
    tagline:     "West-facing. The most dramatic sunsets in the Indian Ocean.",
    maxOccupancy: 3,
    sqm:         140,
    placesIndex: 3,
    fallbackImg: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80",
    highlights:  ["Private plunge pool", "West-facing sunset deck", "Glass floor lounge"],
  },
  {
    category:    "honeymoon",
    name:        "Honeymoon Suite",
    tagline:     "The most private, most romantic villa on the island.",
    maxOccupancy: 2,
    sqm:         160,
    placesIndex: 4,
    fallbackImg: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
    highlights:  ["Private pool with day beds", "In-villa dining setup", "His & hers outdoor bath"],
  },
] as const;

// Seaplane cost is $450/person RT — used on this page (vs speedboat $90 used in general enquiry)
const SEAPLANE_RATE = TRANSFERS.seaplane.perPersonRoundTrip;

// ─── Availability badge ───────────────────────────────────────────────────────

function AvailBadge({ units }: { units: number }) {
  const { label, variant, dot } = availabilityBadge(units);
  const cls = {
    available:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    limited:     "bg-orange-50 text-orange-700 border-orange-200",
    unavailable: "bg-gray-50 text-gray-500 border-gray-200",
  }[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === "available" ? "bg-emerald-500" : "bg-orange-500"} animate-pulse`} />}
      {!dot && <AlertTriangle className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ─── Date/pax strip ───────────────────────────────────────────────────────────

function todayStr()  { return new Date().toISOString().split("T")[0]; }
function plusDays(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

interface SearchBarProps {
  checkIn:     string;
  checkOut:    string;
  adults:      number;
  children:    number;
  onCheckIn:   (v: string) => void;
  onCheckOut:  (v: string) => void;
  onAdults:    (v: number) => void;
  onChildren:  (v: number) => void;
}

function SearchBar({ checkIn, checkOut, adults, children, onCheckIn, onCheckOut, onAdults, onChildren }: SearchBarProps) {
  const inputCls = "border border-white/20 bg-white/10 text-white placeholder-white/60 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow";
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <label className={labelCls}>Check-in</label>
        <input
          type="date" value={checkIn} min={todayStr()}
          onChange={(e) => {
            onCheckIn(e.target.value);
            if (e.target.value >= checkOut) {
              const d = new Date(e.target.value); d.setDate(d.getDate() + 3);
              onCheckOut(d.toISOString().split("T")[0]);
            }
          }}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Check-out</label>
        <input type="date" value={checkOut} min={checkIn}
          onChange={(e) => onCheckOut(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Adults</label>
        <select value={adults} onChange={(e) => onAdults(Number(e.target.value))} className={inputCls}>
          {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} Adult{n !== 1 ? "s" : ""}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Children</label>
        <select value={children} onChange={(e) => onChildren(Number(e.target.value))} className={inputCls}>
          {[0,1,2,3,4].map((n) => <option key={n} value={n}>{n} Child{n !== 1 ? "ren" : ""}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Direct rate breakdown (seaplane) ────────────────────────────────────────

function DirectBreakdown({ quote }: { quote: StayQuote }) {
  const f = formatCurrency;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/70">{quote.nights}n × {f(quote.directNightlyRate)}</span>
        <span className="text-white font-semibold">{f(quote.directSubtotal)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-white/60">+ GST (16%)</span>
        <span className="text-white/80">+{f(quote.taxes.gst)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-white/60">+ Service charge (10%)</span>
        <span className="text-white/80">+{f(quote.taxes.serviceCharge)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-white/60">+ Green Tax</span>
        <span className="text-white/80">+{f(quote.taxes.greenTax)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-white/60 flex items-center gap-1">
          <Plane className="w-3 h-3" /> + {quote.transferLabel}
        </span>
        <span className="text-white/80">+{f(quote.transferCost)}</span>
      </div>
      <div className="border-t border-white/20 pt-2 flex justify-between">
        <span className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider">All-inclusive Total</span>
        <span className="font-serif text-lg font-bold text-white">{f(quote.directTotal)}</span>
      </div>
    </div>
  );
}

// ─── Villa card ───────────────────────────────────────────────────────────────

interface VillaCardProps {
  villa:    typeof VILLA_CATALOGUE[number];
  quote:    StayQuote;
  rank:     number;       // 1-based; 1-3 get "Best Value" crown treatment
  unlocked: boolean;
  onUnlockClick: () => void;
  onEnquire: (q: StayQuote, name: string) => void;
}

function VillaCard({ villa, quote, rank, unlocked, onUnlockClick, onEnquire }: VillaCardProps) {
  const f = formatCurrency;
  const nights = quote.nights;
  const isTop3 = rank <= 3;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col transition-transform hover:-translate-y-1 duration-300 ${isTop3 ? "border-[var(--color-gold)]" : "border-gray-100"}`}>
      {/* Image */}
      <div className="relative h-52">
        <PlacesImage
          index={villa.placesIndex}
          fallback={villa.fallbackImg}
          alt={villa.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Rank crown */}
        {isTop3 && (
          <div className="absolute top-3 left-3">
            <span className="bg-[var(--color-gold)] text-[var(--color-ocean)] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              #{rank} Best Value
            </span>
          </div>
        )}

        {/* Availability */}
        <div className="absolute top-3 right-3">
          <AvailBadge units={quote.availableUnits} />
        </div>

        {/* Name */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-serif text-xl font-bold text-white leading-tight">{villa.name}</h3>
          <p className="text-white/70 text-xs mt-0.5">{villa.sqm} m² · max {villa.maxOccupancy} guests</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <p className="text-sm text-gray-500">{villa.tagline}</p>

        {/* Highlights */}
        <ul className="space-y-1">
          {villa.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-gold)] flex-shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        {/* ── PUBLIC RATE (always visible) ── */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            OTA Reference Rate
          </p>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="font-serif text-3xl font-bold text-gray-500">{f(quote.publicNightlyRate)}</span>
            <span className="text-sm text-gray-400">/night</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{nights} nights = {f(quote.publicTotal)}</span>
            <span className="italic">(room only)</span>
          </div>
          <div className="space-y-0.5">
            {["GST 16%", "Service charge 10%", "Green Tax", "Seaplane transfers"].map((ex) => (
              <div key={ex} className="flex items-center gap-1.5 text-xs text-red-400">
                <XCircle className="w-3 h-3 flex-shrink-0" /> {ex} not included
              </div>
            ))}
          </div>
        </div>

        {/* ── DIRECT RATE (gated / unlocked) ── */}
        {unlocked ? (
          <div className="rounded-xl bg-[var(--color-ocean)] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">Your Direct Rate</p>
                <p className="text-xs text-white/60 mt-0.5">All taxes + seaplane included</p>
              </div>
              <span className="bg-[var(--color-gold)] text-[var(--color-ocean)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Save {DIRECT_DISCOUNT_PERCENT}%
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl font-bold text-white">{f(quote.directNightlyRate)}</span>
              <span className="text-sm text-white/60">/night</span>
            </div>

            <DirectBreakdown quote={quote} />

            <div className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-3 py-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <p className="text-xs text-emerald-200 font-semibold">
                You save {f(quote.savingsValue)} vs OTA + no hidden extras
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => onEnquire(quote, villa.name)}
              className="mt-1"
            >
              Get This Rate — {f(quote.directTotal)}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-white/50">
              <Radio className="w-3 h-3 animate-pulse text-[var(--color-gold)]" />
              Offer sent within 24h · Email or WhatsApp
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 p-4 flex flex-col items-center gap-3 text-center relative overflow-hidden">
            {/* blurred preview numbers */}
            <div className="select-none pointer-events-none">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-1">Your Direct Rate</p>
              <p className="font-serif text-3xl font-bold text-[var(--color-ocean)] blur-[6px]">
                {f(quote.directNightlyRate)}/night
              </p>
              <p className="text-sm text-[var(--color-ocean)] blur-[5px] mt-1">
                All-inclusive total: {f(quote.directTotal)}
              </p>
              <p className="text-xs text-[var(--color-ocean)]/60 blur-[4px] mt-0.5">
                Incl. taxes + seaplane transfer · Save {DIRECT_DISCOUNT_PERCENT}%
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <Lock className="w-5 h-5 text-[var(--color-gold)]" />
              <p className="text-xs font-semibold text-[var(--color-ocean)]">
                Register to reveal your exclusive rate
              </p>
              <p className="text-[10px] text-gray-400">
                Incl. all taxes + seaplane · 9% below any OTA
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={onUnlockClick}>
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Unlock My Rate
            </Button>
          </div>
        )}

        {/* Min stay note */}
        {quote.minStay > 1 && (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-center">
            Minimum {quote.minStay} nights
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Gate modal overlay ───────────────────────────────────────────────────────

function GateModal({ onUnlock, onClose }: { onUnlock: () => void; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <RateGate onUnlock={onUnlock} />
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export function AvailablePage() {
  const [checkIn,   setCheckIn]   = useState(todayStr());
  const [checkOut,  setCheckOut]  = useState(plusDays(7));
  const [adults,    setAdults]    = useState(2);
  const [children,  setChildren]  = useState(0);
  const [unlocked,  setUnlocked]  = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("rs_unlocked") === "1";
  });
  const [showGate,  setShowGate]  = useState(false);
  const [enquireData, setEnquireData] = useState<{ quote: StayQuote; name: string } | null>(null);

  const { rates, loading: ratesLoading } = useRates(); // no arg = subscribe to all 4 categories
  const { inventory }                    = useInventory();

  const handleUnlock = useCallback(() => {
    localStorage.setItem("rs_unlocked", "1");
    setUnlocked(true);
    setShowGate(false);
  }, []);

  // Build a quote per villa category using live rates if available
  const buildQuote = useCallback((category: string): StayQuote => {
    const liveRate = rates.get(category);
    const liveInv  = inventory.get(category);

    if (liveRate?.publicRate && !ratesLoading) {
      return buildStayQuote({
        villaCategory:     category,
        checkIn, checkOut, adults, children,
        publicNightlyRate: liveRate.publicRate,
        availableUnits:    liveInv?.available ?? liveRate.availability,
        minStay:           liveRate.minStay,
        transferType:      "seaplane",
      });
    } else if (liveRate && !ratesLoading) {
      const impliedPublic = liveRate.directRate / (1 - 9 / 100);
      return buildStayQuote({
        villaCategory:     category,
        checkIn, checkOut, adults, children,
        publicNightlyRate: impliedPublic,
        availableUnits:    liveInv?.available ?? liveRate.availability,
        minStay:           liveRate.minStay,
        transferType:      "seaplane",
      });
    }

    // Fallback to baseline — still use seaplane transfer
    return buildStayQuote({
      villaCategory:     category,
      checkIn, checkOut, adults, children,
      publicNightlyRate: BASELINE_PUBLIC_RATES[category] ?? 920,
      availableUnits:    BASELINE_AVAILABILITY[category] ?? 5,
      minStay:           BASELINE_MIN_STAY[category] ?? 3,
      isFallback:        true,
      transferType:      "seaplane",
    });
  }, [checkIn, checkOut, adults, children, rates, inventory, ratesLoading]);

  // Sort villa catalogue by public nightly rate ascending (cheapest first)
  const sorted = [...VILLA_CATALOGUE].sort(
    (a, b) => (BASELINE_PUBLIC_RATES[a.category] ?? 0) - (BASELINE_PUBLIC_RATES[b.category] ?? 0)
  );

  const nights = countNights(checkIn, checkOut);
  const totalGuests = adults + children;
  const seaplaneCostPreview = SEAPLANE_RATE * totalGuests;

  return (
    <>
      {/* ── Hero strip ─────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-ocean)] pt-28 pb-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest mb-3">
            Real-Time Availability · All Villa Categories
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Available Villas &amp; Rates
          </h1>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-8">
            Public OTA rates shown for all villas below. Register for free to unlock your exclusive 9% lower direct rate — all-inclusive with taxes and seaplane transfer.
          </p>

          {/* Date / pax selector */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5">
            <SearchBar
              checkIn={checkIn} checkOut={checkOut} adults={adults} children={children}
              onCheckIn={setCheckIn} onCheckOut={setCheckOut} onAdults={setAdults} onChildren={setChildren}
            />
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-white/50">
              <span>{nights} night{nights !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span>{totalGuests} guest{totalGuests !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Plane className="w-3 h-3" />
                Seaplane from Malé: {formatCurrency(seaplaneCostPreview)} RT for party
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Unlock CTA banner (shown when locked) ──────────────────────────── */}
      {!unlocked && (
        <div className="bg-[var(--color-gold)] py-3">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[var(--color-ocean)] text-sm font-semibold">
              <Lock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Register free to unlock direct rates — 9% below OTA, taxes + seaplane included
            </p>
            <Button variant="secondary" size="sm" onClick={() => setShowGate(true)}>
              Unlock My Rate
            </Button>
          </div>
        </div>
      )}

      {/* ── Villa grid ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[var(--color-sand-cool)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Sorted: cheapest first
              </p>
              <h2 className="font-serif text-2xl font-bold text-[var(--color-ocean)]">
                All Categories — {nights} night{nights !== 1 ? "s" : ""}
              </h2>
            </div>
            {unlocked && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct rates unlocked
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sorted.map((villa, idx) => {
              const quote = buildQuote(villa.category);
              return (
                <VillaCard
                  key={villa.category}
                  villa={villa}
                  quote={quote}
                  rank={idx + 1}
                  unlocked={unlocked}
                  onUnlockClick={() => setShowGate(true)}
                  onEnquire={(q, name) => setEnquireData({ quote: q, name })}
                />
              );
            })}
          </div>

          {/* Legend */}
          {!unlocked && (
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500 mb-3">
                One registration unlocks all four direct rates instantly.
              </p>
              <Button variant="primary" size="lg" onClick={() => setShowGate(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Unlock All Direct Rates
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Gate modal ─────────────────────────────────────────────────────── */}
      {showGate && (
        <GateModal
          onUnlock={handleUnlock}
          onClose={() => setShowGate(false)}
        />
      )}

      {/* ── Enquiry modal (post-unlock) ─────────────────────────────────────── */}
      {enquireData && (
        <EnquiryModal
          quote={enquireData.quote}
          onClose={() => setEnquireData(null)}
        />
      )}
    </>
  );
}
