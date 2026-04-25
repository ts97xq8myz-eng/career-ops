"use client";

import { useState } from "react";
import { RateSearch } from "@/components/booking/rate-search";
import { StayQuoteDisplay } from "@/components/booking/stay-quote";
import { EnquiryModal } from "@/components/booking/enquiry-modal";
import { buildFallbackQuote } from "@/lib/rates/calculator";
import type { StayQuote } from "@/lib/rates/calculator";

function todayStr() { return new Date().toISOString().split("T")[0]; }
function plusDaysStr(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

interface VillaBookingSidebarProps {
  villaCategory: string;
  villaName:     string;
}

export function VillaBookingSidebar({ villaCategory, villaName }: VillaBookingSidebarProps) {
  const [quote, setQuote] = useState<StayQuote>(() =>
    buildFallbackQuote({
      villaCategory,
      checkIn:  todayStr(),
      checkOut: plusDaysStr(7),
      adults:   2,
      children: 0,
    })
  );
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="sticky top-24 space-y-4">
        {/* Search inputs */}
        <RateSearch
          initialVilla={villaCategory}
          onQuote={setQuote}
        />

        {/* Rate comparison + CTA */}
        <StayQuoteDisplay
          quote={quote}
          villaName={villaName}
          onEnquire={() => setModalOpen(true)}
        />
      </div>

      {/* Enquiry modal */}
      {modalOpen && (
        <EnquiryModal
          quote={quote}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
