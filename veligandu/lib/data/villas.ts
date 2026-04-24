import type { Villa } from "@/types";

export const VILLAS_SEED: Villa[] = [
  {
    id: "villa-001",
    slug: "overwater-villa",
    name: "Classic Overwater Villa",
    category: "overwater",
    shortDescription: "Private deck, glass floor panels, and direct lagoon access. The Maldives as you imagined it.",
    description:
      "Step out of your villa directly into the warm Indian Ocean. The Classic Overwater Villa features a spacious private deck with an infinity edge, glass floor panels for watching marine life below, and a four-poster bed facing the horizon. Sun loungers, outdoor shower, and a private ladder into the crystal lagoon complete the experience.",
    sqm: 92,
    maxOccupancy: 3,
    bedrooms: 1,
    images: [
      {
        url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=85",
        alt: "Overwater Villa Exterior with Private Deck",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=85",
        alt: "Overwater Villa Interior",
      },
      {
        url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=85",
        alt: "Private Deck with Ocean View",
      },
    ],
    amenities: [
      { icon: "waves", label: "Direct lagoon access" },
      { icon: "wifi", label: "High-speed Wi-Fi" },
      { icon: "air-vent", label: "Air conditioning" },
      { icon: "tv", label: "Smart TV" },
      { icon: "bath", label: "Outdoor bathtub" },
      { icon: "wind", label: "Ceiling fan" },
      { icon: "coffee", label: "Nespresso machine" },
      { icon: "refrigerator", label: "Minibar" },
    ],
    highlights: [
      "Glass floor panels",
      "Private infinity deck",
      "Direct lagoon ladder",
      "Outdoor rain shower",
    ],
    fromRateUSD: 850,
    available: true,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "villa-002",
    slug: "beach-villa",
    name: "Beachfront Villa",
    category: "beach",
    shortDescription: "Soft sand, swaying palms, and a private stretch of white beach at your doorstep.",
    description:
      "The Beachfront Villa sits directly on the powdery white sand, with a private terrace shaded by coconut palms. The interior is a blend of natural materials and modern luxury, with a king-size bed, open-air bathroom, and direct access to the most secluded part of the island beach.",
    sqm: 110,
    maxOccupancy: 4,
    bedrooms: 1,
    images: [
      {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=85",
        alt: "Beachfront Villa with Private Terrace",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85",
        alt: "Beach Villa Interior",
      },
    ],
    amenities: [
      { icon: "waves", label: "Private beach access" },
      { icon: "wifi", label: "High-speed Wi-Fi" },
      { icon: "air-vent", label: "Air conditioning" },
      { icon: "bath", label: "Open-air bathroom" },
      { icon: "coffee", label: "Nespresso machine" },
      { icon: "refrigerator", label: "Minibar" },
    ],
    highlights: [
      "Private beach terrace",
      "Open-air garden bathroom",
      "Daybed under palms",
      "Outdoor shower",
    ],
    fromRateUSD: 650,
    available: true,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "villa-003",
    slug: "sunset-overwater-villa",
    name: "Sunset Overwater Villa",
    category: "sunset-overwater",
    shortDescription: "West-facing. Every evening you get the most spectacular sunset in the Indian Ocean.",
    description:
      "Built on the western lagoon, the Sunset Overwater Villa is designed for those who want the most dramatic sunsets in the Maldives. Spacious at 140 m², it features a private pool, two sun decks, a glass floor lounge, and premium materials throughout. The ultimate overwater experience.",
    sqm: 140,
    maxOccupancy: 3,
    bedrooms: 1,
    images: [
      {
        url: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=85",
        alt: "Sunset Overwater Villa at Dusk",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=85",
        alt: "Sunset Overwater Villa Private Pool",
      },
    ],
    amenities: [
      { icon: "waves", label: "Private plunge pool" },
      { icon: "wifi", label: "High-speed Wi-Fi" },
      { icon: "air-vent", label: "Air conditioning" },
      { icon: "bath", label: "Outdoor bathtub" },
      { icon: "coffee", label: "Nespresso machine" },
      { icon: "refrigerator", label: "Minibar" },
      { icon: "tv", label: "Smart TV" },
    ],
    highlights: [
      "West-facing sunset views",
      "Private plunge pool",
      "Glass floor lounge",
      "Double sun deck",
    ],
    fromRateUSD: 1100,
    available: true,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "villa-004",
    slug: "honeymoon-suite",
    name: "Honeymoon Suite",
    category: "honeymoon",
    shortDescription: "Champagne on arrival. A floating sanctuary designed for two, with every luxury considered.",
    description:
      "The Honeymoon Suite is our most intimate and romantic villa. Champagne, rose petals, and a couples massage setup await your arrival. The private pool cantilevers over the lagoon, and the suite features a dedicated butler, in-villa dining, and a personalised sunset cruise as part of the package.",
    sqm: 180,
    maxOccupancy: 2,
    bedrooms: 1,
    images: [
      {
        url: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=1200&q=85",
        alt: "Honeymoon Suite with Flower Bath",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=85",
        alt: "Honeymoon Suite Private Pool",
      },
    ],
    amenities: [
      { icon: "waves", label: "Infinity private pool" },
      { icon: "user", label: "Dedicated butler" },
      { icon: "wifi", label: "High-speed Wi-Fi" },
      { icon: "air-vent", label: "Air conditioning" },
      { icon: "bath", label: "Jacuzzi & flower bath" },
      { icon: "coffee", label: "Champagne welcome" },
      { icon: "ship", label: "Sunset cruise included" },
    ],
    highlights: [
      "Infinity pool over lagoon",
      "Dedicated butler",
      "Sunset cruise included",
      "In-villa dining setup",
    ],
    fromRateUSD: 1400,
    available: true,
    featured: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export function getVillaBySlug(slug: string): Villa | undefined {
  return VILLAS_SEED.find((v) => v.slug === slug);
}
