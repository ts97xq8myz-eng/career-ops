import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const comparePublicRates = functions.https.onCall(async (request) => {
  const { villaCategory } = request.data as { villaCategory: string };

  const snap = await db.collection("rates")
    .where("villaCategory", "==", villaCategory)
    .limit(1)
    .get();

  if (snap.empty) {
    return { hasComparison: false };
  }

  const rate = snap.docs[0].data();
  const directRate = rate.directBookingRate as number;
  const otaRate = rate.bookingComRateBeforeTax as number | undefined;

  if (!otaRate) return { hasComparison: false };

  const savings = otaRate - directRate;
  const savingsPercent = Math.round((savings / otaRate) * 100);

  return {
    hasComparison: true,
    directRate,
    otaRate,
    savings: Math.max(0, savings),
    savingsPercent: Math.max(0, savingsPercent),
    source: "booking.com (before tax)",
    lastUpdated: rate.lastSyncedAt ?? new Date().toISOString(),
  };
});
