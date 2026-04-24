import { type NextRequest, NextResponse } from "next/server";
import { getFallbackRate } from "@/lib/rates/engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const villaCategory = searchParams.get("villaCategory") ?? "overwater";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const adults = Number(searchParams.get("adults") ?? 2);
  const children = Number(searchParams.get("children") ?? 0);

  // In production: query Firestore rates collection via admin SDK
  // For now: return fallback rate
  const rate = getFallbackRate(villaCategory);
  rate.checkIn = checkIn;
  rate.checkOut = checkOut;
  rate.adults = adults;
  rate.children = children;

  return NextResponse.json(rate);
}
