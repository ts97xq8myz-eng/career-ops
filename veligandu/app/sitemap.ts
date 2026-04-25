import type { MetadataRoute } from "next";
import { VILLAS_SEED } from "@/lib/data/villas";

export const dynamic = "force-static";

const BASE = "https://veligandu.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/villas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/offers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/experiences`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/dining`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/transfers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/book`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  const villaRoutes: MetadataRoute.Sitemap = VILLAS_SEED.map((v) => ({
    url: `${BASE}/villas/${v.slug}`,
    lastModified: new Date(v.updatedAt),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...villaRoutes];
}
