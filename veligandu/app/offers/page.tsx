import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/layout/hero";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Special Offers",
  description:
    "Exclusive direct-booking offers at Veligandu Island Resort. Honeymoon packages, early bird deals, and seasonal promotions.",
};

const OFFERS = [
  {
    id: "honeymoon-2025",
    title: "Honeymoon Escape Package",
    category: "Honeymoon",
    image: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=800&q=80",
    description:
      "Champagne on arrival, daily breakfast, a sunset cruise for two, and a 30-minute couples massage. Available in the Honeymoon Suite.",
    savings: "Save $650 vs. booking separately",
    validUntil: "31 December 2025",
    villaCategory: "honeymoon",
    highlight: "Most Popular",
  },
  {
    id: "earlybird-2025",
    title: "Early Bird — 20% Off",
    category: "Seasonal",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    description:
      "Book at least 90 days in advance and receive 20% off the base rate across all villa categories. Non-refundable.",
    savings: "Save 20% on base rate",
    validUntil: "30 June 2025",
    villaCategory: "",
    highlight: "Limited Availability",
  },
  {
    id: "longstay-2025",
    title: "Stay 7, Pay 5",
    category: "Long Stay",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
    description:
      "Book a minimum of 7 nights and enjoy 2 nights complimentary. Applies to all overwater villas. Daily breakfast included.",
    savings: "2 nights free on 7-night stays",
    validUntil: "28 February 2026",
    villaCategory: "overwater",
    highlight: "Best Value",
  },
  {
    id: "dive-2025",
    title: "Dive & Stay Package",
    category: "Experience",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80",
    description:
      "5 nights in a Beach Villa with 10 guided dives included. Perfect for underwater explorers. PADI instructors available.",
    savings: "Dives worth $400 included",
    validUntil: "31 October 2025",
    villaCategory: "beach",
    highlight: null,
  },
];

export default function OffersPage() {
  return (
    <>
      <PageHero
        title="Special Offers"
        subtitle="Exclusive packages available only when you book direct."
        image="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=85"
      />

      <section className="py-24 bg-[var(--color-sand-cool)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Direct Booking Exclusives"
            title="Current Offers"
            subtitle="These packages are only available when you book directly with us."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {OFFERS.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hero)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-56">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="gold">{offer.category}</Badge>
                    {offer.highlight && <Badge variant="promo">{offer.highlight}</Badge>}
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[var(--color-ocean)]">{offer.title}</h3>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{offer.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-[var(--color-gold-dark)] font-semibold text-sm">{offer.savings}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Valid until {offer.validUntil}</p>
                    </div>
                    <Link href={`/book?villaCategory=${offer.villaCategory}&offer=${offer.id}`}>
                      <Button variant="primary" size="sm">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
