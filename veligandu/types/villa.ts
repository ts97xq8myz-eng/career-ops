export type VillaCategory =
  | "overwater"
  | "beach"
  | "sunset-overwater"
  | "honeymoon";

export interface VillaAmenity {
  icon: string;
  label: string;
}

export interface VillaImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface Villa {
  id: string;
  slug: string;
  name: string;
  category: VillaCategory;
  shortDescription: string;
  description: string;
  sqm: number;
  maxOccupancy: number;
  bedrooms: number;
  images: VillaImage[];
  amenities: VillaAmenity[];
  highlights: string[];
  fromRateUSD: number;
  available: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export const VILLA_CATEGORY_LABELS: Record<VillaCategory, string> = {
  overwater: "Overwater Villa",
  beach: "Beach Villa",
  "sunset-overwater": "Sunset Overwater Villa",
  honeymoon: "Honeymoon Suite",
};
