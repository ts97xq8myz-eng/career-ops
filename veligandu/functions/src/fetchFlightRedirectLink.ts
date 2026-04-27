import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface FlightInput {
  origin: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
}

export const fetchFlightRedirectLink = functions.https.onCall(async (request) => {
  const { origin, checkIn, checkOut, adults = 2, children = 0 } = request.data as FlightInput;

  // Try to get partner config from Firestore
  const snap = await db.collection("flight_redirects")
    .where("origin", "==", origin)
    .where("isActive", "==", true)
    .limit(3)
    .get();

  if (!snap.empty) {
    const links = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    functions.logger.info("kafka:flight-search-clicked", { origin, checkIn });
    return { links };
  }

  // Fallback: Google Flights deep-link
  const googleFlightsUrl = `https://www.google.com/flights#flt=${origin}.MLE.${checkIn}*MLE.${origin}.${checkOut};c:USD;e:1;px:${adults};sd:1;t:h`;

  return {
    links: [
      {
        id: `${origin}-MLE-google`,
        origin,
        destination: "MLE",
        redirectUrl: googleFlightsUrl,
        partner: "Google Flights",
        label: `Search flights from ${origin} to Malé (MLE)`,
        isActive: true,
      },
    ],
  };
});
