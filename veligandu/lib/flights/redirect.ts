import { NEAREST_AIRPORTS, type FlightRedirect, type AirportInfo } from "@/types";

const DESTINATION_IATA = "MLE"; // Velana International, Malé

export function getAirportByCode(iata: string): AirportInfo | undefined {
  return NEAREST_AIRPORTS.find((a) => a.iata === iata);
}

export function buildFlightRedirectUrl(
  origin: string,
  checkIn: string,
  checkOut: string,
  adults: number = 2,
  children: number = 0,
  baseUrl?: string
): string {
  const base =
    baseUrl ??
    process.env.NEXT_PUBLIC_FLIGHT_ENGINE_URL ??
    "https://www.google.com/flights";

  const params = new URLSearchParams({
    hl: "en",
    curr: "USD",
    q: `Flights from ${origin} to ${DESTINATION_IATA}`,
    tfs: `CAEQAhooagcIARIDTUxFGgcI...`,
  });

  // For Skyscanner-style deep-link format
  if (base.includes("skyscanner")) {
    return `${base}/${origin}/${DESTINATION_IATA}/${checkIn.replace(/-/g, "")}/${checkOut.replace(/-/g, "")}?adults=${adults}&children=${children}`;
  }

  // Generic Google Flights fallback
  return `https://www.google.com/flights#flt=${origin}.${DESTINATION_IATA}.${checkIn}*${DESTINATION_IATA}.${origin}.${checkOut};c:USD;e:1;px:${adults};sd:1;t:h`;
}

export function getMockFlightRedirects(origin: string, checkIn: string, checkOut: string): FlightRedirect[] {
  return [
    {
      id: `${origin}-MLE-google`,
      origin,
      destination: DESTINATION_IATA,
      redirectUrl: buildFlightRedirectUrl(origin, checkIn, checkOut),
      partner: "Google Flights",
      label: `Search flights from ${origin} to Maldives`,
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function detectNearestAirport(ip?: string): Promise<string> {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return "DXB";
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { next: { revalidate: 3600 } });
    if (!res.ok) return "DXB";
    const data = (await res.json()) as { country_code?: string };
    const countryToAirport: Record<string, string> = {
      GB: "LHR", DE: "FRA", FR: "CDG", SG: "SIN", IN: "BOM",
      CN: "PEK", JP: "NRT", AU: "SYD", AE: "DXB", MV: "MLE",
    };
    return countryToAirport[data.country_code ?? ""] ?? "DXB";
  } catch {
    return "DXB";
  }
}
