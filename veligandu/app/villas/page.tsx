import type { Metadata } from "next";
import { PageHero } from "@/components/layout/hero";
import { VillaCard } from "@/components/villas/villa-card";
import { SectionHeader } from "@/components/ui/section-header";
import { VILLAS_SEED } from "@/lib/data/villas";

export const metadata: Metadata = {
  title: "Villas & Suites",
  description:
    "Explore overwater villas, beach villas, and honeymoon suites at Veligandu Island Resort, Maldives. Book direct for the best rate.",
};

export default function VillasPage() {
  return (
    <>
      <PageHero
        title="Villas & Suites"
        subtitle="Every room is a private sanctuary. Choose your corner of paradise."
        image="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1920&q=85"
        placesIndex={1}
      />

      <section className="py-24 bg-[var(--color-sand-cool)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Accommodation"
            title="Find Your Villa"
            subtitle="From intimate beach retreats to west-facing overwater suites with private pools — all villas include direct lagoon or beach access."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {VILLAS_SEED.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        </div>
      </section>

      {/* Direct booking note */}
      <section className="py-12 bg-[var(--color-ocean)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <p className="text-[var(--color-gold)] text-sm font-semibold uppercase tracking-widest mb-2">
            Direct Booking Advantage
          </p>
          <p className="text-lg">
            All rates shown are our lowest available direct rates — always less than Booking.com before tax. No hidden fees. No surprises.
          </p>
        </div>
      </section>
    </>
  );
}
