export interface AirportInfo {
  iata: string;
  name: string;
  city: string;
  country: string;
  hasDirectFlight: boolean;
}

export const NEAREST_AIRPORTS: AirportInfo[] = [
  { iata: "MLE", name: "Velana International Airport", city: "Malé", country: "Maldives", hasDirectFlight: true },
  { iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", hasDirectFlight: true },
  { iata: "LHR", name: "London Heathrow Airport", city: "London", country: "UK", hasDirectFlight: false },
  { iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", hasDirectFlight: true },
  { iata: "BOM", name: "Chhatrapati Shivaji Airport", city: "Mumbai", country: "India", hasDirectFlight: false },
  { iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", hasDirectFlight: false },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", hasDirectFlight: false },
  { iata: "PEK", name: "Beijing Capital Airport", city: "Beijing", country: "China", hasDirectFlight: false },
  { iata: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", hasDirectFlight: false },
  { iata: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", hasDirectFlight: false },
];

export interface FlightRedirect {
  id: string;
  origin: string;
  destination: string;
  redirectUrl: string;
  partner: string;
  label: string;
  isActive: boolean;
  updatedAt: string;
}
