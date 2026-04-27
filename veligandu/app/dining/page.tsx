import type { Metadata } from "next";
import { PageHero } from "@/components/layout/hero";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { PlacesImage } from "@/components/ui/places-image";

export const metadata: Metadata = {
  title: "Dining",
  description:
    "From overwater fine dining to barefoot beachside grills — world-class cuisine at Veligandu Island Resort.",
};

const RESTAURANTS = [
  {
    name: "Coral Restaurant",
    type: "Main Restaurant",
    fallback: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    placesIndex: 11,
    desc: "Our signature overwater restaurant serves an international buffet for breakfast and à la carte dinners with panoramic lagoon views. Dress code: smart casual.",
    hours: "Breakfast 7–10am · Dinner 7–10pm",
    cuisine: "International",
    mealPlans: ["BB", "HB", "FB"],
  },
  {
    name: "Sand Bar & Grill",
    type: "Casual Dining",
    fallback: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    placesIndex: 12,
    desc: "Barefoot dining on white sand. Fresh seafood and grilled Maldivian specialties served at the water's edge. Live music on Friday evenings.",
    hours: "Lunch 12–3pm · Dinner 6:30–10pm",
    cuisine: "Seafood & Grill",
    mealPlans: ["FB"],
  },
  {
    name: "Sunset Lounge",
    type: "Bar & Light Bites",
    fallback: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
    placesIndex: 13,
    desc: "Cocktails, wines, and light snacks as the sky turns gold. The best seats on the island for the west-facing sunset. Live DJ on weekends.",
    hours: "4pm – midnight",
    cuisine: "Cocktails & Tapas",
    mealPlans: [],
  },
  {
    name: "In-Villa Dining",
    type: "Private",
    fallback: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    placesIndex: 10,
    desc: "Available in all villas. Our team delivers a personalised dining experience to your private deck — breakfast at sunrise, dinner under the stars.",
    hours: "Available 24/7",
    cuisine: "Full menu",
    mealPlans: [],
  },
];

const MEAL_PLAN_LABELS: Record<string, string> = {
  BB: "Bed & Breakfast",
  HB: "Half Board",
  FB: "Full Board",
};

export default function DiningPage() {
  return (
    <>
      <PageHero
        title="Dining"
        subtitle="Exceptional cuisine in exceptional settings — from overwater to barefoot on the sand."
        image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=85"
        placesIndex={10}
      />

      <section className="py-24 bg-[var(--color-sand-cool)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Restaurants & Bars"
            title="Where Every Meal is a Memory"
            subtitle="Three restaurants, one bar, and in-villa dining — all under the Maldivian sky."
          />

          <div className="flex flex-col gap-10">
            {RESTAURANTS.map((r, i) => (
              <div
                key={r.name}
                className={`grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] bg-white ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="relative h-72 md:h-full min-h-[16rem]">
                  <PlacesImage
                    index={r.placesIndex}
                    fallback={r.fallback}
                    alt={r.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center gap-4">
                  <div>
                    <Badge variant="ocean">{r.type}</Badge>
                    <h3 className="font-serif text-2xl font-bold text-[var(--color-ocean)] mt-3">{r.name}</h3>
                    <p className="text-gray-600 mt-2 leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-[var(--color-ocean-muted)]">
                    <p><strong className="text-[var(--color-ocean)]">Hours:</strong> {r.hours}</p>
                    <p><strong className="text-[var(--color-ocean)]">Cuisine:</strong> {r.cuisine}</p>
                    {r.mealPlans.length > 0 && (
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {r.mealPlans.map((mp) => (
                          <Badge key={mp} variant="gold">{MEAL_PLAN_LABELS[mp]}</Badge>
                        ))}
                      </div>
                    )}
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
