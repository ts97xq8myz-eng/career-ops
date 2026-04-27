"use client";

import { PageHero } from "@/components/layout/hero";
import { SectionHeader } from "@/components/ui/section-header";
import { FlightHelper } from "@/components/booking/flight-helper";
import { Badge } from "@/components/ui/badge";
import { Plane, Ship, Clock, DollarSign } from "lucide-react";

const TRANSFER_OPTIONS = [
  {
    type: "Seaplane Transfer",
    icon: Plane,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    duration: "~35 minutes",
    from: "$340 per person return",
    description:
      "The classic Maldives arrival experience. Twin Otter seaplanes operate from Velana (MLE) during daylight hours only. Book in advance — seats are limited. Spectacular aerial views of atolls.",
    highlights: ["Panoramic aerial views", "Direct to resort jetty", "Complimentary drinks onboard", "Operates sunrise to sunset"],
    color: "ocean",
  },
  {
    type: "Speedboat Transfer",
    icon: Ship,
    image: "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=800&q=80",
    duration: "~2 hours",
    from: "$120 per person return",
    description:
      "An affordable and scenic transfer by luxury speedboat from Malé. Operates day and night, making it ideal for late flight arrivals. Refreshments included.",
    highlights: ["Day & night service", "Late arrival compatible", "Direct from Malé jetty", "Budget-friendly option"],
    color: "gold",
  },
];

export default function TransfersPage() {
  return (
    <>
      <PageHero
        title="Getting Here"
        subtitle="From Malé, Veligandu is 35 minutes by seaplane or 2 hours by speedboat."
        image="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=85"
        placesIndex={0}
      />

      <section className="py-24 bg-[var(--color-sand-cool)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Resort Access"
            title="Transfer Options"
            subtitle="Choose the transfer experience that suits your schedule and style."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {TRANSFER_OPTIONS.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.type} className="bg-white rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-ocean)]/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[var(--color-ocean)]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold text-[var(--color-ocean)]">{t.type}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" /> {t.duration}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <DollarSign className="w-3 h-3" /> {t.from}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{t.description}</p>
                    <ul className="flex flex-col gap-2">
                      {t.highlights.map((h) => (
                        <li key={h} className="text-sm text-[var(--color-ocean-muted)] flex items-center gap-2">
                          <span className="text-[var(--color-gold)]">✦</span> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flight finder */}
          <div className="max-w-2xl">
            <SectionHeader
              eyebrow="Getting to Maldives"
              title="Find Your Flights"
              subtitle="We'll detect your nearest airport and help you search for the best flights to Velana International Airport (MLE), Malé."
            />
            <FlightHelper />
          </div>

          {/* Nearest airports */}
          <div className="mt-16">
            <h3 className="font-serif text-2xl font-bold text-[var(--color-ocean)] mb-6">Airports with Direct Flights to Malé</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { iata: "DXB", city: "Dubai", airline: "Emirates, flydubai" },
                { iata: "SIN", city: "Singapore", airline: "Singapore Airlines" },
                { iata: "MLE", city: "Malé (local)", airline: "Island Aviation" },
                { iata: "BOM", city: "Mumbai", airline: "IndiGo, Air India" },
              ].map((a) => (
                <div key={a.iata} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                  <p className="font-bold text-[var(--color-ocean)] text-xl">{a.iata}</p>
                  <p className="text-sm text-[var(--color-ocean-muted)]">{a.city}</p>
                  <Badge variant="available" className="mt-2 text-xs">{a.airline}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
