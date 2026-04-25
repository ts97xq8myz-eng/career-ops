"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RateSearch } from "@/components/booking/rate-search";
import { StayQuoteDisplay } from "@/components/booking/stay-quote";
import { EnquiryModal } from "@/components/booking/enquiry-modal";
import { buildFallbackQuote } from "@/lib/rates/calculator";
import type { StayQuote } from "@/lib/rates/calculator";

const VILLA_NAMES: Record<string, string> = {
  "overwater":        "Classic Overwater Villa",
  "beach":            "Beachfront Villa",
  "sunset-overwater": "Sunset Overwater Villa",
  "honeymoon":        "Honeymoon Suite",
};

function todayStr() { return new Date().toISOString().split("T")[0]; }
function plusDaysStr(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

export function HomeRateSearch() {
  const [quote, setQuote] = useState<StayQuote>(() =>
    buildFallbackQuote({
      villaCategory: "overwater",
      checkIn:       todayStr(),
      checkOut:      plusDaysStr(7),
      adults:        2,
      children:      0,
    })
  );
  const [showQuote, setShowQuote] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleQuote = (q: StayQuote) => {
    setQuote(q);
    setShowQuote(true);
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-6">
        {/* Search inputs — dark mode variant */}
        <RateSearch
          onQuote={handleQuote}
          compact={false}
          initialVilla="overwater"
          initialCheckIn={todayStr()}
          initialCheckOut={plusDaysStr(7)}
        />

        {/* Quote result — appears after first calculation */}
        {showQuote && (
          <div className="border-t border-white/20 pt-6">
            <StayQuoteDisplay
              quote={quote}
              villaName={VILLA_NAMES[quote.villaCategory] ?? quote.villaCategory}
              onEnquire={() => setModalOpen(true)}
            />
          </div>
        )}
      </div>

      {modalOpen && (
        <EnquiryModal
          quote={quote}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
