import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface CalcInput {
  villaCategory: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

export const calculateRates = functions.https.onCall(async (request) => {
  const { villaCategory, checkIn, checkOut, adults, children } = request.data as CalcInput;

  if (!villaCategory || !checkIn || !checkOut) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
  }

  // Query Firestore for rates matching villa + date range
  const snap = await db.collection("rates")
    .where("villaCategory", "==", villaCategory)
    .where("dateFrom", "<=", checkIn)
    .limit(5)
    .get();

  if (snap.empty) {
    // Return fallback rate
    const FALLBACK: Record<string, number> = {
      overwater: 850, beach: 650, "sunset-overwater": 1100, honeymoon: 1400,
    };
    const base = FALLBACK[villaCategory] ?? 750;
    return {
      villaCategory,
      directRatePerNight: base,
      directRateTotal: base,
      taxAmount: base * 0.16,
      taxIncludedTotal: base * 1.16,
      availability: 5,
      mealPlan: "BB",
      isBestRate: true,
    };
  }

  // Use the most specific rate found
  const rateDoc = snap.docs[0].data();
  const nights = Math.max(
    1,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
  );
  const directRate = (rateDoc.directBookingRate as number) ?? 850;
  const taxRate = 0.16;
  const taxAmount = directRate * taxRate;

  functions.logger.info("kafka:rate-updates", { villaCategory, checkIn, checkOut });

  return {
    villaCategory,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    directRatePerNight: directRate,
    directRateTotal: directRate * nights,
    publicRatePerNight: rateDoc.bookingComRateBeforeTax,
    publicRateTotal: rateDoc.bookingComRateBeforeTax
      ? (rateDoc.bookingComRateBeforeTax as number) * nights : undefined,
    mealPlan: rateDoc.mealPlan ?? "BB",
    taxAmount: taxAmount * nights,
    taxIncludedTotal: (directRate + taxAmount) * nights,
    availability: rateDoc.availability ?? 5,
    isBestRate: true,
  };
});
