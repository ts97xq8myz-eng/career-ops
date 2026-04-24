import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/hero";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Snorkelling, diving, spa, sunset cruises and island excursions at Veligandu Island Resort, Maldives.",
};

const EXPERIENCES = [
  {
    title: "House Reef Snorkelling",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80",
    desc: "Step off your villa deck directly onto one of the richest reefs in the Maldives. Resident turtles, manta rays, and whale sharks await.",
    tag: "Marine",
  },
  {
    title: "PADI Scuba Diving",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    desc: "Our PADI-certified dive centre offers courses for all levels. Night dives, drift dives, and shark point are not to be missed.",
    tag: "Marine",
  },
  {
    title: "Sunset Cruise",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    desc: "Champagne on the Indian Ocean as the sun dips below the horizon. Includes snacks, dolphin spotting, and stargazing on the return.",
    tag: "Romance",
  },
  {
    title: "Spa & Wellness",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80",
    desc: "The Veligandu Spa is set overwater with ocean views from the treatment table. Signature Maldivian rituals use locally sourced ingredients.",
    tag: "Wellness",
  },
  {
    title: "Watersports",
    image: "https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800&q=80",
    desc: "Jet ski, windsurfing, kayaking, paddleboarding, and parasailing — the lagoon is your playground.",
    tag: "Adventure",
  },
  {
    title: "Island Fishing",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    desc: "Traditional Maldivian hand-line fishing at sunset, followed by our chef cooking your catch at the beachside grill.",
    tag: "Culture",
  },
];

export default function ExperiencesPage() {
  return (
    <>
      <PageHero
        title="Experiences"
        subtitle="Every day at Veligandu is an invitation to explore above and below the waterline."
        image="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1920&q=85"
      />

      <section className="py-24 bg-[var(--color-sand-cool)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Island Activities"
            title="Life on the Lagoon"
            subtitle="From the reef below your villa to the stars above — there is always something extraordinary waiting."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXPERIENCES.map((exp) => (
              <div key={exp.title} className="bg-white rounded-2xl overflow-hidden shadow-[var(--shadow-card)] group hover:shadow-[var(--shadow-hero)] hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[var(--color-ocean)] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {exp.tag}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-[var(--color-ocean)] mb-2">{exp.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/book">
              <Button variant="primary" size="lg">Book Your Stay</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
