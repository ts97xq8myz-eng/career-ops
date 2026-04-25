import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "streetviewpixels-pa.googleapis.com" },
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9607779519",
    NEXT_PUBLIC_RESORT_EMAIL:   process.env.NEXT_PUBLIC_RESORT_EMAIL   ?? "veligandu@reservationsandsales.com",
    NEXT_PUBLIC_RESORT_PHONE:   process.env.NEXT_PUBLIC_RESORT_PHONE   ?? "+960 666 0519",
  },
};

export default nextConfig;
