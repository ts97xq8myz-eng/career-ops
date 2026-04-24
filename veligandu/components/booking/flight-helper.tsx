"use client";

import { useEffect, useState } from "react";
import { Plane, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { NEAREST_AIRPORTS, type AirportInfo } from "@/types";
import { buildFlightRedirectUrl } from "@/lib/flights/redirect";
import { trackEvent } from "@/lib/ads/gtag";

interface FlightHelperProps {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  onAirportSelect?: (iata: string) => void;
}

export function FlightHelper({
  checkIn = "",
  checkOut = "",
  adults = 2,
  children = 0,
  onAirportSelect,
}: FlightHelperProps) {
  const [selectedIata, setSelectedIata] = useState("DXB");
  const [detectedAirport, setDetectedAirport] = useState<AirportInfo | null>(null);

  useEffect(() => {
    // Try to detect nearest airport from IP
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data: { country_code?: string }) => {
        const countryToAirport: Record<string, string> = {
          GB: "LHR", DE: "FRA", FR: "CDG", SG: "SIN", IN: "BOM",
          CN: "PEK", JP: "NRT", AU: "SYD", AE: "DXB", MV: "MLE",
        };
        const iata = countryToAirport[data.country_code ?? ""] ?? "DXB";
        setSelectedIata(iata);
        setDetectedAirport(NEAREST_AIRPORTS.find((a) => a.iata === iata) ?? null);
      })
      .catch(() => {/* silent fallback to DXB */});
  }, []);

  const handleSelect = (iata: string) => {
    setSelectedIata(iata);
    onAirportSelect?.(iata);
  };

  const redirectUrl = buildFlightRedirectUrl(selectedIata, checkIn, checkOut, adults, children);

  const handleFlightClick = () => {
    trackEvent("flight_search_clicked", {
      origin: selectedIata,
      checkIn,
      checkOut,
    });
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[var(--color-ocean)] rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Plane className="w-5 h-5 text-[var(--color-gold)]" />
        <h3 className="font-semibold">Flight Finder</h3>
      </div>

      {detectedAirport && (
        <p className="text-white/70 text-sm mb-3">
          Detected nearest airport: <strong className="text-white">{detectedAirport.iata} — {detectedAirport.city}</strong>
        </p>
      )}

      <Select
        label=""
        value={selectedIata}
        onChange={(e) => handleSelect(e.target.value)}
        options={NEAREST_AIRPORTS.map((a) => ({
          value: a.iata,
          label: `${a.iata} — ${a.city}, ${a.country}`,
        }))}
        className="mb-4 bg-white/10 border-white/30 text-white [&>option]:text-[var(--color-ocean)]"
      />

      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={handleFlightClick}
        className="flex items-center gap-2"
      >
        <Plane className="w-4 h-4" />
        Search Flights to Maldives
        <ExternalLink className="w-3.5 h-3.5" />
      </Button>
      <p className="text-white/50 text-xs mt-2 text-center">
        You will be redirected to our flight booking partner.
      </p>
    </div>
  );
}
