import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { VILLAS_SEED, getVillaBySlug } from "@/lib/data/villas";
import { getVillaPhotos } from "@/lib/data/places-photos";
import { VILLA_CATEGORY_LABELS } from "@/types";
import { RateDisplay } from "@/components/booking/rate-display";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { getFallbackRate } from "@/lib/rates/engine";
import { Users, Maximize2, Bed, CheckCircle } from "lucide-react";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return VILLAS_SEED.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const villa = getVillaBySlug(slug);
  if (!villa) return {};
  return {
    title: villa.name,
    description: villa.shortDescription,
    openGraph: {
      title: `${villa.name} — Veligandu Maldives`,
      description: villa.shortDescription,
      images: [{ url: villa.images[0]?.url ?? "" }],
    },
  };
}

export default async function VillaDetailPage({ params }: Params) {
  const { slug } = await params;
  const villa = getVillaBySlug(slug);
  if (!villa) notFound();

  const rate = getFallbackRate(villa.category);
  const placesPhotos = getVillaPhotos(villa.category);

  return (
    <>
      {/* Gallery — 3 Google Places photos */}
      <div className="pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 h-[60vh] md:h-[70vh]">
          <div className="relative">
            <Image
              src={placesPhotos[0]}
              alt={`${villa.name} — primary view`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="hidden md:grid grid-rows-2">
            {placesPhotos.slice(1, 3).map((src, i) => (
              <div key={i} className="relative">
                <Image
                  src={src}
                  alt={`${villa.name} — view ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-[var(--color-sand-cool)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <p className="text-[var(--color-gold)] text-sm font-semibold uppercase tracking-widest mb-2">
                {VILLA_CATEGORY_LABELS[villa.category]}
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-[var(--color-ocean)] mb-4">
                {villa.name}
              </h1>
              <div className="h-0.5 w-16 bg-[var(--color-gold)] mb-6" />

              <div className="flex flex-wrap gap-4 text-sm text-[var(--color-ocean-muted)] mb-8">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4" /> {villa.sqm} m²
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Up to {villa.maxOccupancy} guests
                </span>
                <span className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" /> {villa.bedrooms} bedroom
                </span>
                {villa.available && <Badge variant="available" dot>Available</Badge>}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-10">{villa.description}</p>

              <SectionHeader eyebrow="" title="Villa Highlights" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {villa.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-[var(--color-ocean)]">
                    <CheckCircle className="w-4 h-4 text-[var(--color-gold)]" />
                    {h}
                  </li>
                ))}
              </ul>

              <SectionHeader eyebrow="" title="Amenities" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {villa.amenities.map((a) => (
                  <div key={a.label} className="flex items-center gap-2 text-sm text-[var(--color-ocean-muted)] bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                    <span className="w-5 h-5 text-[var(--color-gold)] text-lg">✦</span>
                    {a.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky booking sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 flex flex-col gap-5">
                {/* JSON-LD for villa */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Accommodation",
                      name: villa.name,
                      description: villa.shortDescription,
                      occupancy: { "@type": "QuantitativeValue", maxValue: villa.maxOccupancy },
                      floorSize: { "@type": "QuantitativeValue", value: villa.sqm, unitCode: "MTK" },
                      image: villa.images.map((i) => i.url),
                    }),
                  }}
                />

                <RateDisplay rate={rate} showDetails={false} />

                <Link href={`/book?villaCategory=${villa.category}`}>
                  <Button variant="primary" size="xl" fullWidth>
                    Book This Villa
                  </Button>
                </Link>

                <Link href="/book">
                  <Button variant="ghost" size="lg" fullWidth>
                    Request a Quote
                  </Button>
                </Link>

                <div className="bg-white rounded-xl p-4 border border-gray-100 text-sm text-[var(--color-ocean-muted)]">
                  <p className="font-semibold text-[var(--color-ocean)] mb-1">Need help choosing?</p>
                  <p>Our reservations team is available 24/7 to help you find the perfect villa for your stay.</p>
                  <a
                    href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9609999999").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-[var(--color-gold)] font-semibold hover:text-[var(--color-gold-dark)]"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
