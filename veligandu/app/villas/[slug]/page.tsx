import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { VILLAS_SEED, getVillaBySlug } from "@/lib/data/villas";
import { getVillaPhotos } from "@/lib/data/places-photos";
import { VILLA_CATEGORY_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { VillaBookingSidebar } from "@/components/villas/villa-booking-sidebar";
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

  const placesPhotos = getVillaPhotos(villa.category);

  return (
    <>
      {/* ── Gallery ────────────────────────────────────────────────────────── */}
      <div className="pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 h-[55vh] md:h-[68vh]">
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

      {/* ── Content + sidebar ──────────────────────────────────────────────── */}
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
                    <CheckCircle className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              <SectionHeader eyebrow="" title="Amenities" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {villa.amenities.map((a) => (
                  <div
                    key={a.label}
                    className="flex items-center gap-2 text-sm text-[var(--color-ocean-muted)] bg-white rounded-lg px-3 py-2.5 border border-gray-100"
                  >
                    <span className="text-[var(--color-gold)]">✦</span>
                    {a.label}
                  </div>
                ))}
              </div>

              {/* Direct booking advantage strip */}
              <div className="mt-12 bg-[var(--color-ocean)] rounded-2xl p-6 text-white">
                <p className="text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest mb-3">
                  Direct Booking Advantage
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/80">
                  {[
                    ["9% Below Any OTA", "Always cheaper than Booking.com — before taxes and transfers."],
                    ["All-Inclusive Price", "Taxes, Green Tax & speedboat transfer included."],
                    ["24-Hour Confirmation", "Personal response from our reservations team."],
                  ].map(([title, body]) => (
                    <div key={title}>
                      <p className="font-semibold text-white mb-1">{title}</p>
                      <p>{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Live booking sidebar (client component) ─────────────────── */}
            <div className="lg:col-span-1">
              {/* JSON-LD */}
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

              <VillaBookingSidebar
                villaCategory={villa.category}
                villaName={villa.name}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
