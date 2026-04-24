import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9609999999",
    NEXT_PUBLIC_RESORT_EMAIL: process.env.NEXT_PUBLIC_RESORT_EMAIL ?? "reservations@veligandu.com",
  },
};

export default nextConfig;
