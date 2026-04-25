import type { Metadata } from "next";
import { AvailablePage } from "@/components/booking/available-page";

export const metadata: Metadata = {
  title: "Available Villas & Rates — Veligandu Maldives",
  description:
    "Check real-time villa availability at Veligandu Island Resort. See public OTA rates, then register to unlock your exclusive 9% lower direct rate — all-inclusive with seaplane transfer.",
};

export default function Page() {
  return <AvailablePage />;
}
