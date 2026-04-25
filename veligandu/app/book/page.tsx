"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RateSearch } from "@/components/booking/rate-search";
import { StayQuoteDisplay } from "@/components/booking/stay-quote";
import { EnquiryModal } from "@/components/booking/enquiry-modal";
import { FlightHelper } from "@/components/booking/flight-helper";
import { SectionHeader } from "@/components/ui/section-header";
import { buildFallbackQuote } from "@/lib/rates/calculator";
import type { StayQuote } from "@/lib/rates/calculator";
import { Shield, Clock, MessageCircle, TrendingDown } from "lucide-react";

function todayStr() { return new Date().toISOString().split("T")[0]; }
function plusDaysStr(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

const TRUST_PILLARS = [
  { icon: TrendingDown, title: "9% Below Any OTA",    body: "Our direct rate is always 9% below Booking.com — before we even add the tax & transfer savings." },
  { icon: Shield,       title: "All-inclusive Price",  body: "Taxes, Green Tax, service charge, and return speedboat transfer are all included. No surprises at checkout." },
  { icon: Clock,        title: "24-Hour Confirmation", body: "We confirm every enquiry personally within 24 hours — with a named reservations contact." },
  { icon: MessageCircle, title: "Your Channel",        body: "Receive your offer by email or WhatsApp — whichever you prefer." },
];

function BookInner() {
  const params      = useSearchParams();
  const initVilla   = params.get("villaCategory") ?? "overwater";
  const initCheckIn = params.get("checkIn")       ?? todayStr();
  const initCheckOut = params.get("checkOut")     ?? plusDaysStr(7);
  const initAdults  = Number(params.get("adults") ?? "2");
  const initChildren = Number(params.get("children") ?? "0");

  const [quote, setQuote] = useState<StayQuote>(() =>
    buildFallbackQuote({
      villaCategory: initVilla,
      checkIn:       initCheckIn,
      checkOut:      initCheckOut,
      adults:        initAdults,
      children:      initChildren,
    })
  );
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-sand-cool)]">
      {/* ── Hero strip ───────────────────────────────────────────────────── */}
      <div className="bg-[var(--color-ocean)] pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest mb-3">
            Direct Booking · Best Rate Guaranteed
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Your Exclusive Rate
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Select your dates and villa. We calculate your all-inclusive direct price — always 9% below any OTA — and send a personalised offer within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left column: Search + Quote ────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sticky search panel */}
            <div className="sticky top-20 z-20">
              <RateSearch
                initialVilla={initVilla}
                initialCheckIn={initCheckIn}
                initialCheckOut={initCheckOut}
                initialAdults={initAdults}
                initialChildren={initChildren}
                onQuote={setQuote}
              />
            </div>

            {/* Rate comparison */}
            <StayQuoteDisplay
              quote={quote}
              villaName={
                {
                  "overwater":        "Classic Overwater Villa",
                  "beach":            "Beachfront Villa",
                  "sunset-overwater": "Sunset Overwater Villa",
                  "honeymoon":        "Honeymoon Suite",
                }[quote.villaCategory] ?? quote.villaCategory
              }
              onEnquire={() => setModalOpen(true)}
            />

            {/* Flight helper */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Flight Connection</p>
              <FlightHelper
                checkIn={quote.checkIn}
                checkOut={quote.checkOut}
                adults={quote.adults}
                children={quote.children}
              />
            </div>
          </div>

          {/* ── Right column: Trust + Info ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* How it works */}
            <div className="bg-[var(--color-ocean)] rounded-2xl p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-4">What happens next</p>
              <ol className="space-y-3">
                {[
                  "You submit your enquiry — no payment now",
                  "We confirm availability within 24 hours",
                  "You receive a personalised all-inclusive offer",
                  "Reply YES to hold your villa for 24 hours",
                  "Optional: secure with a payment pre-authorisation",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-[var(--color-ocean)] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-white/80">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Trust pillars */}
            <div className="space-y-3">
              {TRUST_PILLARS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-sand)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[var(--color-ocean)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-ocean)] text-sm">{title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rate rule reminder */}
            <div className="bg-[var(--color-sand)] rounded-xl border border-[var(--color-gold)]/20 p-4 text-xs text-[var(--color-ocean-muted)] leading-relaxed">
              <strong className="text-[var(--color-ocean)]">Rate Rule:</strong> The public OTA rate shown is the room-only rate before taxes and transfers. Our direct price includes everything — taxes (GST 16%, service charge 10%, Green Tax $6/person/night) plus a return speedboat transfer. No hidden fees. No surprises.
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry modal */}
      {modalOpen && (
        <EnquiryModal
          quote={quote}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center text-[var(--color-ocean)]">
        Loading…
      </div>
    }>
      <BookInner />
    </Suspense>
  );
}
