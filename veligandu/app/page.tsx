import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/layout/hero";
import { BookingWidget } from "@/components/booking/booking-widget";
import { VillaCard } from "@/components/villas/villa-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { PlacesImage } from "@/components/ui/places-image";
import { VILLAS_SEED } from "@/lib/data/villas";
import { CheckCircle, Star, ShieldCheck, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "Veligandu Island Resort — Direct Booking Maldives",
  description:
    "Book direct at Veligandu Island Resort for the lowest available rate. Overwater villas, beach villas, and honeymoon suites in North Ari Atoll, Maldives.",
};

const DIRECT_BENEFITS = [
  { icon: ShieldCheck, title: "Lowest Rate Guaranteed", desc: "Book direct and beat any OTA price." },
  { icon: CheckCircle, title: "Flexible Cancellation", desc: "More generous terms than third-party sites." },
  { icon: Headphones, title: "24/7 Concierge", desc: "Direct line to our reservations team." },
  { icon: Star, title: "Exclusive Extras", desc: "Complimentary transfers, wine, and more." },
];

const EXPERIENCES = [
  {
    title: "Snorkelling & Diving",
    fallback: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&q=80",
    placesIndex: 5,
    href: "/experiences",
  },
  {
    title: "Spa & Wellness",
    fallback: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80",
    placesIndex: 6,
    href: "/experiences",
  },
  {
    title: "Fine Dining",
    fallback: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    placesIndex: 10,
    href: "/dining",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col">
        <Hero
          title={`The Maldives,\nAs It Should Be`}
          subtitle="An intimate island paradise where every villa floats above turquoise waters and every sunset belongs to you."
          eyebrow="Veligandu Island Resort · North Ari Atoll"
          image="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=90"
          placesIndex={0}
          overlay="dark"
          height="full"
        />
        <div className="absolute bottom-8 left-0 right-0 z-20 max-w-5xl mx-auto px-4 sm:px-6">
          <BookingWidget />
        </div>
      </section>

      {/* Direct Booking Benefits Strip */}
      <section className="bg-[var(--color-ocean)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {DIRECT_BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[var(--color-gold)]" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-white/60 text-xs mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Villas */}
      <section className="py-24 bg-[var(--color-sand-cool)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Accommodation"
            title="Villas & Suites"
            subtitle="From secluded beachfront bungalows to overwater retreats with glass floors — every villa is a destination in itself."
            centered
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VILLAS_SEED.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/villas">
              <Button variant="secondary" size="lg">
                Explore All Villas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rate Comparison Banner */}
      <section className="py-16 bg-[var(--color-gold-pale)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--color-gold-dark)] text-sm font-semibold uppercase tracking-widest mb-3">
            Best Rate Promise
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-ocean)] mb-4">
            Book Direct. Save More.
          </h2>
          <p className="text-[var(--color-ocean-muted)] text-lg mb-8 max-w-2xl mx-auto">
            Our direct booking rate is always lower than what you'll find on Booking.com, Expedia, or any OTA — before tax. We compare rates in real time so you never overpay.
          </p>
          <Link href="/book">
            <Button variant="primary" size="xl">
              Get the Best Rate Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Experiences */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Island Life"
            title="Experiences"
            subtitle="A world of discovery above and below the waterline."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EXPERIENCES.map((exp) => (
              <Link key={exp.title} href={exp.href} className="group relative h-80 rounded-2xl overflow-hidden">
                <PlacesImage
                  index={exp.placesIndex}
                  fallback={exp.fallback}
                  alt={exp.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-serif text-2xl font-bold text-white">{exp.title}</h3>
                  <p className="text-[var(--color-gold)] text-sm mt-1">Discover →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-[var(--color-ocean)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-[var(--color-gold)] text-[var(--color-gold)]" />
            ))}
          </div>
          <blockquote className="font-serif text-2xl md:text-3xl text-white italic leading-relaxed mb-6">
            "The most beautiful place I've ever stayed. The overwater villa was beyond anything we imagined — and booking direct saved us over $400."
          </blockquote>
          <p className="text-[var(--color-gold)] font-medium">— Sarah & James, United Kingdom</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[var(--color-sand-cool)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            eyebrow="Plan Your Escape"
            title="Your Maldives Story Begins Here"
            subtitle="Send us an enquiry and our reservations team will respond within 24 hours with a personalised offer."
            centered
          />
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/book">
              <Button variant="primary" size="xl">Book Your Stay</Button>
            </Link>
            <Link href="/offers">
              <Button variant="ghost" size="xl">See Current Offers</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
